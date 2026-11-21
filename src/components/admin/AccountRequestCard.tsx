"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { approveAccountRequest, rejectAccountRequest } from "@/actions/account-requests-admin";
import DeleteButton from "@/components/admin/DeleteButton";
import CopyLink from "@/components/admin/CopyLink";
import { ROLE_DESCRIPTION, ROLE_LABEL, type Role } from "@/lib/roles";

export type AccountRequestItem = {
  id: number;
  name: string;
  email: string;
  message: string | null;
  createdAt: string;
  alreadyRegistered: boolean;
};

/** Una richiesta di account: scelta del ruolo, conferma o rifiuto. */
export default function AccountRequestCard({
  request,
  roles,
  receivedLabel,
}: {
  request: AccountRequestItem;
  /** ruoli che chi conferma può assegnare */
  roles: Role[];
  receivedLabel: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(approveAccountRequest.bind(null, request.id), undefined);

  if (state?.done) {
    return (
      <div className="admin-request admin-request--done">
        <div className="admin-success">{state.done}</div>
        {state.link && <CopyLink link={state.link} />}
        <button type="button" className="admin-btn admin-btn-ghost" onClick={() => router.refresh()}>
          OK
        </button>
      </div>
    );
  }

  return (
    <div className="admin-request">
      <div className="admin-request__who">
        <div className="admin-request__name">{request.name}</div>
        <a className="admin-link" href={`mailto:${request.email}`}>
          {request.email}
        </a>
        <div className="admin-request__date">Richiesta {receivedLabel}</div>
      </div>
      {request.message && <p className="admin-request__message">{request.message}</p>}
      {request.alreadyRegistered && (
        <div className="admin-error">Esiste già un account con questa email: puoi rifiutare la richiesta.</div>
      )}
      <form action={formAction} className="admin-request__actions">
        <label className="admin-label" htmlFor={`role-${request.id}`} style={{ margin: 0 }}>
          Ruolo
        </label>
        <select
          id={`role-${request.id}`}
          name="role"
          required
          defaultValue="utente"
          className="admin-input admin-request__role"
          disabled={request.alreadyRegistered}
        >
          {roles.map((role) => (
            <option key={role} value={role} title={ROLE_DESCRIPTION[role]}>
              {ROLE_LABEL[role]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={pending || request.alreadyRegistered}
        >
          {pending ? "Conferma…" : "Conferma l'iscrizione"}
        </button>
        <DeleteButton
          action={rejectAccountRequest.bind(null, request.id)}
          label="Rifiuta"
          confirmMessage={`Rifiutare la richiesta di ${request.name}? Non riceverà nessuna email.`}
        />
      </form>
      {state?.error && <div className="admin-error">{state.error}</div>}
    </div>
  );
}
