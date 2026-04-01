const prisma = require("../../config/prisma");

const normalize = (v) => String(v || "").trim().toUpperCase();

const INSTITUTIONS_SEED = [
  {
    sigle: "IFRI",
    nom: "Institut de Formation et de Recherche en Informatique",
  },
  {
    sigle: "EPAC",
    nom: "École Polytechnique d'Abomey-Calavi",
  },
  {
    sigle: "FSS",
    nom: "Faculté des Sciences de la Santé",
  },
];

async function ensureSeedInstitutions() {
  const existing = await prisma.institution.findMany({
    select: { id: true, sigle: true },
  });

  const existingSet = new Set(existing.map((i) => normalize(i.sigle)));

  const toCreate = INSTITUTIONS_SEED.filter(
    (s) => !existingSet.has(normalize(s.sigle))
  );

  if (!toCreate.length) return;

  try {
    await prisma.institution.createMany({
      data: toCreate.map((x) => ({
        sigle: x.sigle,
        nom: x.nom,
      })),
      skipDuplicates: true,
    });
  } catch {
    for (const x of toCreate) {
      await prisma.institution.create({
        data: {
          sigle: x.sigle,
          nom: x.nom,
        },
      });
    }
  }
}

exports.getInstitutions = async () => {
  await ensureSeedInstitutions();

  return prisma.institution.findMany({
    select: {
      id: true,
      nom: true,
      sigle: true,
      logoUrl: true,
    },
    orderBy: { sigle: "asc" },
  });
};