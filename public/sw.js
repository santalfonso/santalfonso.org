function openNotifDB() {
  return new Promise(function (resolve, reject) {
    var req = indexedDB.open("santalfonso-notifications", 1);
    req.onupgradeneeded = function (e) {
      e.target.result.createObjectStore("notifications", {
        keyPath: "id",
        autoIncrement: true,
      });
    };
    req.onsuccess = function (e) { resolve(e.target.result); };
    req.onerror = function (e) { reject(e.target.error); };
  });
}

function saveNotification(data) {
  return openNotifDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction("notifications", "readwrite");
      tx.objectStore("notifications").add({
        title: data.title,
        body: data.body || "",
        url: data.url || "/",
        receivedAt: new Date().toISOString(),
        read: false,
      });
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  });
}

self.addEventListener("push", function (event) {
  if (!event.data) return;
  var data = event.data.json();
  event.waitUntil(
    saveNotification(data)
      // se l'archivio delle notifiche non funziona, la notifica si mostra comunque
      .catch(function () {})
      .then(function () {
        // Avvisa tutte le finestre aperte che è arrivata una notifica
        return self.clients.matchAll({ includeUncontrolled: true, type: "window" });
      })
      .then(function (clientList) {
        clientList.forEach(function (client) {
          client.postMessage({ type: "NEW_NOTIFICATION" });
        });
        return self.registration.showNotification(data.title, {
          body: data.body,
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          vibrate: [100, 50, 100],
          data: { url: data.url || "/" },
        });
      })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : "/";
  var target = new URL(url, self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      // la pagina della notifica è già aperta: basta mostrarla
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url === target && "focus" in clientList[i]) return clientList[i].focus();
      }
      // un'altra pagina del sito è aperta: la si porta alla pagina della notifica
      for (var j = 0; j < clientList.length; j++) {
        var client = clientList[j];
        if ("focus" in client && "navigate" in client) {
          return client
            .focus()
            .then(function (focused) { return (focused || client).navigate(target); })
            .catch(function () { return clients.openWindow ? clients.openWindow(target) : undefined; });
        }
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
