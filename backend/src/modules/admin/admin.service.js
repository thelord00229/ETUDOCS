const prisma = require("../../config/prisma");
const bcrypt = require("bcryptjs");

const MS_48H = 48 * 60 * 60 * 1000;

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function fmtISODate(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

// Créer un compte agent
exports.creerAgent = async ({ nom, prenom, email, password, role, service, institutionId }) => {
  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("Cet email est déjà utilisé");
    err.statusCode = 400;
    throw err;
  }

  const hash = await bcrypt.hash(password, 12);
  return prisma.utilisateur.create({
    data: {
      nom,
      prenom,
      email,
      password: hash,
      role,
      service: service || null,
      institutionId,
      emailVerifie: true,
      actif: true,
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      service: true,
      institutionId: true,
      actif: true,
    },
  });
};

// Lister les agents d'une institution
exports.getAgents = async (institutionId) => {
  return prisma.utilisateur.findMany({
    where: {
      institutionId,
      role: { not: "ETUDIANT" },
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      service: true,
      actif: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
};

// Activer ou désactiver un compte
exports.toggleActif = async (userId) => {
  const user = await prisma.utilisateur.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error("Utilisateur introuvable");
    err.statusCode = 404;
    throw err;
  }
  return prisma.utilisateur.update({
    where: { id: userId },
    data: { actif: !user.actif },
    select: { id: true, nom: true, prenom: true, actif: true },
  });
};

// Configurer une institution
exports.configurerInstitution = async (institutionId, data) => {
  return prisma.institution.update({
    where: { id: institutionId },
    data: {
      nom: data.nom || undefined,
      directeurNom: data.directeurNom || undefined,
      directeurTitre: data.directeurTitre || undefined,
      directeurAdjointNom: data.directeurAdjointNom || undefined,
      directeurAdjointTitre: data.directeurAdjointTitre || undefined,
      signatureDirecteurUrl: data.signatureDirecteurUrl || undefined,
      signatureDirecteurAdjointUrl: data.signatureDirecteurAdjointUrl || undefined,
      tamponDirecteurUrl: data.tamponDirecteurUrl || undefined,
      tamponDirecteurAdjointUrl: data.tamponDirecteurAdjointUrl || undefined,
      logoUrl: data.logoUrl || undefined,
    },
  });
};

// Statistiques globales
exports.getStatistiques = async (institutionId) => {
  const total = await prisma.demande.count({ where: { institutionId } });

  const parStatut = await prisma.demande.groupBy({
    by: ["statut"],
    where: { institutionId },
    _count: { statut: true },
  });

  const disponibles = await prisma.document.count({
    where: { demande: { institutionId } },
  });

  return {
    total,
    disponibles,
    parStatut: parStatut.map((s) => ({
      statut: s.statut,
      count: s._count.statut,
    })),
  };
};

exports.getInstitutions = async () => {
  return prisma.institution.findMany({
    include: {
      _count: {
        select: {
          utilisateurs: { where: { role: { not: "ETUDIANT" } } },
          demandes: true,
        },
      },
    },
  });
};

// ✅ SLA evolution basé sur Demande.deliveredAt
exports.getSlaEvolution = async ({ days, institutionCode, docType }) => {
  // fenêtre: derniers "days" jours
  const end = startOfDay(new Date());
  end.setDate(end.getDate() + 1); // exclusif
  const start = startOfDay(new Date());
  start.setDate(start.getDate() - (days - 1)); // inclusif

  const where = {
    statut: "DISPONIBLE",
    deliveredAt: { gte: start, lt: end },
  };

  // filtre institution (sigle -> id)
  if (institutionCode !== "ALL") {
    const inst = await prisma.institution.findFirst({
      where: { sigle: institutionCode },
      select: { id: true },
    });
    if (!inst) {
      return { kpis: { sla: 0, slaTarget: 80, deltaSla: 0 }, series: [] };
    }
    where.institutionId = inst.id;
  }

  // filtre docType (adapte au vrai champ)
  // Dans ton Demande: typeDocument ✅
  if (docType !== "ALL") {
    where.typeDocument = docType;
  }

  const demandes = await prisma.demande.findMany({
    where,
    select: {
      id: true,
      createdAt: true,
      deliveredAt: true,
    },
  });

  // buckets pour éviter les "trous"
  const buckets = new Map();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const k = fmtISODate(d);
    buckets.set(k, { date: k, total: 0, ok: 0 });
  }

  for (const dem of demandes) {
    if (!dem.deliveredAt) continue;
    const key = fmtISODate(dem.deliveredAt);
    const b = buckets.get(key);
    if (!b) continue;

    b.total += 1;
    const duration = new Date(dem.deliveredAt).getTime() - new Date(dem.createdAt).getTime();
    if (duration <= MS_48H) b.ok += 1;
  }

  const series = Array.from(buckets.values()).map((b) => {
    const value = b.total === 0 ? null : Math.round((b.ok / b.total) * 100);
    return { date: b.date, value };
  });

  const valid = series.filter((x) => typeof x.value === "number");
  const current = valid.length
    ? Math.round(valid.reduce((a, x) => a + x.value, 0) / valid.length)
    : 0;

  let delta = 0;
  if (days >= 20) {
    const last10 = series.slice(-10).filter((x) => typeof x.value === "number");
    const prev10 = series.slice(-20, -10).filter((x) => typeof x.value === "number");
    const avg = (arr) => (arr.length ? arr.reduce((a, x) => a + x.value, 0) / arr.length : 0);
    delta = Math.round(avg(last10) - avg(prev10));
  }

  return {
    kpis: { sla: current, slaTarget: 80, deltaSla: delta },
    series,
  };
};