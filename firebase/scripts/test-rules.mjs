// Lancia i test delle regole con l'emulatore Firestore.
// L'emulatore richiede Java 21: se esiste l'installazione Adoptium nota la usa,
// altrimenti si affida al Java di sistema.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';

const env = { ...process.env };
const base = 'C:/Program Files/Eclipse Adoptium';
if (existsSync(base)) {
  const jdk = readdirSync(base).filter((d) => d.startsWith('jdk-21')).sort().pop();
  if (jdk) {
    env.JAVA_HOME = `${base}/${jdk}`;
    // Su Windows la variabile si chiama spesso "Path": va aggiornata quella esistente.
    const chiave = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') ?? 'PATH';
    env[chiave] = `${env.JAVA_HOME}/bin${process.platform === 'win32' ? ';' : ':'}${env[chiave] ?? ''}`;
  }
}

const r = spawnSync(
  'firebase',
  ['emulators:exec', '--config', '../firebase.json', '--only', 'firestore', '--project', 'demo-piano', '"vitest run"'],
  { stdio: 'inherit', env, shell: true },
);
process.exit(r.status ?? 1);
