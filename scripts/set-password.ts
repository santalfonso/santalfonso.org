/**
 * Cambia la password di un utente direttamente nel database (quello indicato in .env.local).
 * La password si digita nascosta e non viene mai stampata.
 *
 *   npx tsx --env-file=.env.local scripts/set-password.ts
 */
import { createInterface } from "node:readline";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { users } from "../src/db/schema";

const MIN_LENGTH = 12;

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
const lines = rl[Symbol.asyncIterator]();
let muted = false;
// mentre si digita la password non si mostrano i caratteri
const out = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
const write = out._writeToOutput.bind(rl);
out._writeToOutput = (s: string) => {
  if (!muted) write(s);
};

async function ask(question: string, hidden = false): Promise<string> {
  process.stdout.write(question);
  muted = hidden;
  const { value, done } = await lines.next();
  muted = false;
  if (hidden) process.stdout.write("\n");
  if (done) throw new Error("Operazione annullata.");
  return String(value);
}

async function main() {
  const email = (await ask("Email dell'utente: ")).trim().toLowerCase();
  const user = await db.query.users.findFirst({ where: eq(users.email, email), columns: { id: true, name: true } });
  if (!user) throw new Error("Nessun utente con questa email.");

  const password = await ask(`Nuova password (almeno ${MIN_LENGTH} caratteri): `, true);
  if (password.length < MIN_LENGTH) throw new Error(`La password deve avere almeno ${MIN_LENGTH} caratteri.`);
  const again = await ask("Ripeti la nuova password: ", true);
  if (again !== password) throw new Error("Le due password non coincidono.");

  await db.update(users).set({ passwordHash: await hash(password, 12) }).where(eq(users.id, user.id));
  console.log(`Password aggiornata per ${user.name} (${email}).`);
}

main().then(
  () => {
    rl.close();
    process.exit(0);
  },
  (e) => {
    rl.close();
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
);
