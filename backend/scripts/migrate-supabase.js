const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

function color(value, ansi) {
  return `${ansi}${value}${colors.reset}`;
}

function step(message) {
  console.log(`\n${color("ETAPE", colors.cyan)} ${message}`);
}

function ok(message) {
  console.log(`${color("OK", colors.green)} ${message}`);
}

function ko(message) {
  console.log(`${color("KO", colors.red)} ${message}`);
}

// Lecture simple de .env pour valider la cible avant migration.
function readEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    throw new Error(`Fichier .env introuvable: ${envPath}`);
  }

  const result = {};
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    value = value.replace(/^["']|["']$/g, "");
    result[key] = value;
  }

  return result;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: path.resolve(__dirname, ".."),
    shell: false,
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} a echoue avec le code ${result.status}`);
  }
}

function validateDatabaseUrl() {
  const envPath = path.resolve(__dirname, "..", ".env");
  const env = readEnvFile(envPath);
  const databaseUrl = env.DATABASE_URL;
  const directUrl = env.DIRECT_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL est absente du fichier .env");
  }

  if (databaseUrl.includes("[PASSWORD]") || databaseUrl.includes("[PROJECT_REF]")) {
    throw new Error("Remplacez [PASSWORD] et [PROJECT_REF] dans DATABASE_URL avant de migrer");
  }

  if (!directUrl) {
    throw new Error("DIRECT_URL est absente du fichier .env. Prisma Migrate en a besoin avec Supabase.");
  }

  if (directUrl.includes("[PASSWORD]") || directUrl.includes("[PROJECT_REF]")) {
    throw new Error("Remplacez [PASSWORD] et [PROJECT_REF] dans DIRECT_URL avant de migrer");
  }

  if (!databaseUrl.includes("supabase.co")) {
    console.log(color("Attention: DATABASE_URL ne semble pas pointer vers Supabase.", colors.yellow));
  }

  process.env.DATABASE_URL = databaseUrl;
  process.env.DIRECT_URL = directUrl;
}

function main() {
  console.log(color("\nMigration Supabase EtuDocs", colors.bold));
  const prismaCli = path.resolve(__dirname, "..", "node_modules", "prisma", "build", "index.js");

  try {
    step("Verifier DATABASE_URL");
    validateDatabaseUrl();
    ok("DATABASE_URL validee");

    step("Executer les migrations Prisma");
    run(process.execPath, [prismaCli, "migrate", "deploy"]);
    ok("Migrations appliquees");

    step("Generer Prisma Client");
    run(process.execPath, [prismaCli, "generate"]);
    ok("Client Prisma genere");

    step("Verifier la connexion Supabase");
    run(process.execPath, [path.join("scripts", "verify-supabase.js")]);
    ok("Verification terminee");
  } catch (error) {
    ko(error.message);
    process.exitCode = 1;
  }
}

main();
