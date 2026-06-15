const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function color(value, ansi) {
  return `${ansi}${value}${colors.reset}`;
}

function ok(message) {
  console.log(`${color("OK", colors.green)} ${message}`);
}

function ko(message) {
  console.log(`${color("KO", colors.red)} ${message}`);
}

function info(message) {
  console.log(`${color("INFO", colors.cyan)} ${message}`);
}

function maskDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = "*****";
    return parsed.toString();
  } catch {
    return url.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:*****@");
  }
}

// Lecture simple de .env pour ne pas dependre d'un package dotenv.
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

async function main() {
  console.log(color("\nVerification Supabase EtuDocs", colors.bold));

  const envPath = path.resolve(__dirname, "..", ".env");
  let databaseUrl;

  try {
    const env = readEnvFile(envPath);
    databaseUrl = env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL est absente du fichier .env");
    }

    if (databaseUrl.includes("[PASSWORD]") || databaseUrl.includes("[PROJECT_REF]")) {
      throw new Error("DATABASE_URL contient encore les placeholders [PASSWORD] ou [PROJECT_REF]");
    }

    ok(`DATABASE_URL lue depuis ${envPath}`);
    info(`Cible: ${maskDatabaseUrl(databaseUrl)}`);
  } catch (error) {
    ko(error.message);
    process.exitCode = 1;
    return;
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  try {
    info("Connexion a PostgreSQL via Prisma...");
    const versionRows = await prisma.$queryRaw`SELECT version() AS version`;
    ok("Connexion etablie");
    console.log(`${colors.gray}${versionRows[0].version}${colors.reset}`);

    info("Lecture des tables du schema public...");
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    ok(`${tables.length} table(s) trouvee(s)`);
    if (tables.length === 0) {
      console.log(color("Aucune table. Lancez node scripts/migrate-supabase.js ou npx prisma migrate deploy.", colors.yellow));
    } else {
      for (const table of tables) {
        console.log(`  - ${table.table_name}`);
      }
    }
  } catch (error) {
    ko("Verification Supabase echouee");
    console.error(color(error.message, colors.red));
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
