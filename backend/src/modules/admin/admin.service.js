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

const normalize = (v) => String(v || "").trim().toUpperCase();

// ✅ Seed MVP : toujours 3 institutions
const INSTITUTIONS_SEED = [
  { sigle: "IFRI", nom: "Institut de Formation et de Recherche en Informatique" },
  { sigle: "EPAC", nom: "École Polytechnique d'Abomey-Calavi" },
  { sigle: "FSS",  nom: "Faculté des Sciences de la Santé" },
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

  // createMany si dispo
  try {
    await prisma.institution.createMany({
      data: toCreate.map((x) => ({ sigle: x.sigle, nom: x.nom })),
      skipDuplicates: true,
    });
  } catch {
    // fallback create one by one (selon version prisma / contraintes)
    await prisma.institution.create({ data: { sigle: x.sigle, nom: x.nom } });
  }
}

async function resolveInstitutionId(institutionIdOrSigle) {
  const raw = String(institutionIdOrSigle || "").trim();
  if (!raw) return null;

  const sigle = normalize(raw);

  const inst = await prisma.institution.findFirst({
    where: {
      OR: [
        { id: raw },
        { sigle },
        { nom: { equals: raw, mode: "insensitive" } },
      ],
    },
    select: { id: true, sigle: true, nom: true },
  });

  return inst?.id || null;
}

// Créer un compte agent
exports.creerAgent = async ({
  nom,
  prenom,
  email,
  password,
  role,
  service,
  institutionId,
}) => {
  if (!nom || !prenom || !email || !password || !role) {
    const err = new Error("Champs requis: nom, prenom, email, password, role.");
    err.statusCode = 400;
    throw err;
  }

  const cleanEmail = String(email).trim().toLowerCase();

  const existing = await prisma.utilisateur.findUnique({
    where: { email: cleanEmail },
    select: { id: true },
  });

  if (existing) {
    const err = new Error("Cet email est déjà utilisé");
    err.statusCode = 400;
    throw err;
  }

  // ✅ institution obligatoire
  const resolvedInstitutionId = await resolveInstitutionId(institutionId);
  if (!resolvedInstitutionId) {
    const err = new Error(
      "Institution obligatoire pour créer un agent (institutionId ou sigle)."
    );
    err.statusCode = 400;
    throw err;
  }

  const hash = await bcrypt.hash(password, 12);

  return prisma.utilisateur.create({
    data: {
      nom: String(nom).trim(),
      prenom: String(prenom).trim(),
      email: cleanEmail,
      password: hash,
      role,
      service: service || null,
      institutionId: resolvedInstitutionId,
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
  const user = await prisma.utilisateur.findUnique({
    where: { id: userId },
    select: { id: true, actif: true, nom: true, prenom: true },
  });

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
      description: data.description || undefined,
      sigle: data.sigle ? normalize(data.sigle) : undefined,
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

// ✅ Institutions (avec seed + counts fiables)
exports.getInstitutions = async () => {
  // 1) seed si besoin
  await ensureSeedInstitutions();

  // 2) fetch institutions
  const institutions = await prisma.institution.findMany({
    orderBy: { sigle: "asc" },
    select: {
      id: true,
      nom: true,
      sigle: true,
      logoUrl: true,
      directeurNom: true,
      directeurTitre: true,
      directeurAdjointNom: true,
      directeurAdjointTitre: true,
      signatureDirecteurUrl: true,
      signatureDirecteurAdjointUrl: true,
      tamponDirecteurUrl: true,
      tamponDirecteurAdjointUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // 3) counts (agents + demandes) proprement
  const ids = institutions.map((i) => i.id);

  const agentsCounts = await prisma.utilisateur.groupBy({
    by: ["institutionId"],
    where: {
      institutionId: { in: ids },
      role: { not: "ETUDIANT" },
    },
    _count: { _all: true },
  });

  const demandesCounts = await prisma.demande.groupBy({
    by: ["institutionId"],
    where: { institutionId: { in: ids } },
    _count: { _all: true },
  });

  const mapAgents = new Map(
    agentsCounts.map((x) => [x.institutionId, x._count._all])
  );
  const mapDemandes = new Map(
    demandesCounts.map((x) => [x.institutionId, x._count._all])
  );

  return institutions.map((inst) => ({
    ...inst,
    _count: {
      utilisateurs: mapAgents.get(inst.id) || 0, // ici = agents (non ETUDIANT)
      demandes: mapDemandes.get(inst.id) || 0,
    },
  }));
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
      where: { sigle: normalize(institutionCode) },
      select: { id: true },
    });
    if (!inst) {
      return { kpis: { sla: 0, slaTarget: 80, deltaSla: 0 }, series: [] };
    }
    where.institutionId = inst.id;
  }

  // filtre docType
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
    const duration =
      new Date(dem.deliveredAt).getTime() - new Date(dem.createdAt).getTime();
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
    const last10 = series
      .slice(-10)
      .filter((x) => typeof x.value === "number");
    const prev10 = series
      .slice(-20, -10)
      .filter((x) => typeof x.value === "number");
    const avg = (arr) =>
      arr.length ? arr.reduce((a, x) => a + x.value, 0) / arr.length : 0;
    delta = Math.round(avg(last10) - avg(prev10));
  }

  return {
    kpis: { sla: current, slaTarget: 80, deltaSla: delta },
    series,
  };
};

exports.getDashboard = async () => {
  await ensureSeedInstitutions();

  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // ===== KPIs globaux =====
  const [totalDemandes, demandesEnAttente, docsCeMois, agentsActifs] = await Promise.all([
    prisma.demande.count(),
    prisma.demande.count({ where: { statut: "SOUMISE" } }),
    prisma.document.count({ where: { createdAt: { gte: startMonth, lt: nextMonth } } }),
    prisma.utilisateur.count({
      where: { role: { not: "ETUDIANT" }, actif: true },
    }),
  ]);

  // ===== Institutions =====
  const institutions = await prisma.institution.findMany({
    orderBy: { sigle: "asc" },
    select: { id: true, sigle: true, nom: true },
  });

  const ids = institutions.map((i) => i.id);

  // pending
  const pending = await prisma.demande.groupBy({
    by: ["institutionId"],
    where: { institutionId: { in: ids }, statut: "SOUMISE" },
    _count: { _all: true },
  });

  // traitees = DISPONIBLE + REJETEE + ANNULEE (tu peux ajuster)
  const traitees = await prisma.demande.groupBy({
    by: ["institutionId"],
    where: {
      institutionId: { in: ids },
      statut: { in: ["DISPONIBLE", "REJETEE", "ANNULEE"] },
    },
    _count: { _all: true },
  });

  // agents actifs
  const agents = await prisma.utilisateur.groupBy({
    by: ["institutionId"],
    where: {
      institutionId: { in: ids },
      role: { not: "ETUDIANT" },
      actif: true,
    },
    _count: { _all: true },
  });

  const mapPending = new Map(pending.map((x) => [x.institutionId, x._count._all]));
  const mapTraitees = new Map(traitees.map((x) => [x.institutionId, x._count._all]));
  const mapAgents = new Map(agents.map((x) => [x.institutionId, x._count._all]));

  const parInstitution = institutions.map((inst) => ({
    id: inst.id,
    code: inst.sigle,
    nom: inst.nom,
    attente: mapPending.get(inst.id) || 0,
    traitees: mapTraitees.get(inst.id) || 0,
    agents: mapAgents.get(inst.id) || 0,
  }));

  // ===== Activité système (approx) =====
  const [lastAgent, lastDoc, lastDemande, lastInstitution] = await Promise.all([
    prisma.utilisateur.findFirst({
      where: { role: { not: "ETUDIANT" } },
      orderBy: { createdAt: "desc" },
      select: { prenom: true, nom: true, institution: { select: { sigle: true } }, createdAt: true },
    }),
    prisma.document.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, demande: { select: { institution: { select: { sigle: true } } } } },
    }),
    prisma.demande.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, institution: { select: { sigle: true } }, id: true },
    }),
    prisma.institution.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { sigle: true, updatedAt: true },
    }),
  ]);

  const activity = [
    lastAgent && {
      title: "Nouvel agent ajouté",
      sub: `${lastAgent.prenom} ${lastAgent.nom} • ${lastAgent.institution?.sigle || ""}`.trim(),
      ts: lastAgent.createdAt,
    },
    lastInstitution && {
      title: "Institution mise à jour",
      sub: `${lastInstitution.sigle || ""}`.trim(),
      ts: lastInstitution.updatedAt,
    },
    lastDoc && {
      title: "Document généré",
      sub: `${lastDoc.demande?.institution?.sigle || ""}`.trim(),
      ts: lastDoc.createdAt,
    },
    lastDemande && {
      title: "Nouvelle demande créée",
      sub: `${lastDemande.institution?.sigle || ""} • ${lastDemande.id.slice(0, 8)}`,
      ts: lastDemande.createdAt,
    },
  ].filter(Boolean);

  return {
    kpis: {
      totalDemandes,
      demandesEnAttente,
      docsCeMois,
      agentsActifs,
      nbInstitutions: institutions.length,
    },
    parInstitution,
    activity,
  };
};