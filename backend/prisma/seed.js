require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const AdapterPg = require('@prisma/adapter-pg').PrismaPg;
const _rawDbUrl = process.env.DATABASE_URL;
const _dbUrl = typeof _rawDbUrl === 'string' && _rawDbUrl.startsWith('"') && _rawDbUrl.endsWith('"')
  ? _rawDbUrl.slice(1, -1)
  : _rawDbUrl;

const adapter = new AdapterPg({ connectionString: _dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Démarrage du seed...\n');

  // 1️⃣ Institution IFRI (upsert sécurisé)
  const ifri = await prisma.institution.upsert({
    where: { id: 'institution-ifri-seed' },
    update: { sigle: 'IFRI' }, // ✅ met à jour si déjà existant
    create: {
      id: 'institution-ifri-seed',
      nom: 'Institut de Formation et de Recherche en Informatique',
      sigle: 'IFRI', // ✅ ajouté
      directeurNom: 'Prof. GNIMPIEBA',
      directeurTitre: "Directeur de l'IFRI",
      directeurAdjointNom: 'Dr. ADJOINT',
      directeurAdjointTitre: 'Directeur Adjoint'
    }
  });

  console.log('✅ Institution IFRI prête');

  // 2️⃣ Configuration des pièces requises
  const piecesConfig = [
    { typeDocument: 'RELEVE_NOTES', typePiece: 'CIP', obligatoire: true },
    { typeDocument: 'RELEVE_NOTES', typePiece: 'QUITTANCE', obligatoire: true },
    { typeDocument: 'ATTESTATION_INSCRIPTION', typePiece: 'CIP', obligatoire: true },
    { typeDocument: 'ATTESTATION_INSCRIPTION', typePiece: 'QUITTANCE', obligatoire: true }
  ];

  for (const piece of piecesConfig) {
    await prisma.pieceRequise.upsert({
      where: {
        institutionId_typeDocument_typePiece: {
          institutionId: ifri.id,
          typeDocument: piece.typeDocument,
          typePiece: piece.typePiece
        }
      },
      update: {},
      create: { ...piece, institutionId: ifri.id }
    });
  }

  console.log('✅ Pièces requises configurées');

  // 3️⃣ Comptes de test (un par rôle)
  const hash = await bcrypt.hash('Password123!', 12);

  const comptes = [
    { id: 'user-etudiant-seed', nom: 'AGBETI', prenom: 'Test', email: 'etudiant@test.com', role: 'ETUDIANT', numeroEtudiant: 'IFRI2024001', service: null },
    { id: 'user-secadj-seed', nom: 'HOUNHOUI', prenom: 'Test', email: 'sec.adj@test.com', role: 'SECRETAIRE_ADJOINT', service: null },
      { id: 'user-secgen-seed', nom: 'ADOKO', prenom: 'Test', email: 'sec.gen@test.com', role: 'SECRETAIRE_GENERAL', service: null },
    { id: 'user-chefexam-seed', nom: 'CHEF', prenom: 'Examens', email: 'chef.exam@test.com', role: 'CHEF_DIVISION', service: 'EXAMENS' },
    { id: 'user-chefscol-seed', nom: 'CHEF', prenom: 'Scolarite', email: 'chef.scol@test.com', role: 'CHEF_DIVISION', service: 'SCOLARITE' },
    { id: 'user-diradj-seed', nom: 'DIRECTEUR', prenom: 'Adjoint', email: 'dir.adj@test.com', role: 'DIRECTEUR_ADJOINT', service: null },
    { id: 'user-dir-seed', nom: 'DIRECTEUR', prenom: 'Principal', email: 'dir@test.com', role: 'DIRECTEUR', service: null },
    { id: 'user-admin-seed', nom: 'SUPER', prenom: 'Admin', email: 'admin@test.com', role: 'SUPER_ADMIN', service: null }
  ];

  for (const compte of comptes) {
    await prisma.utilisateur.upsert({
      where: { email: compte.email },
      update: {},
      create: {
        ...compte,
        password: hash,
        actif: true,
        emailVerifie: true,
        institutionId: ifri.id
      }
    });
  }

  console.log('Comptes de test créés\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Mot de passe universel : Password123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  comptes.forEach(c => {
    console.log(`${c.role.padEnd(25)} → ${c.email}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });