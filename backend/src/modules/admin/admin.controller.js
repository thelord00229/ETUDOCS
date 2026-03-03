const adminService = require("./admin.service");
const asyncHandler = require("../../utils/asyncHandler");
const prisma = require("../../config/prisma");

const DEFAULT_PASSWORD = "Password123!";

exports.getSlaEvolution = asyncHandler(async (req, res) => {
  const daysRaw = parseInt(req.query.days || "20", 10);
  const days = Number.isFinite(daysRaw) ? Math.min(Math.max(daysRaw, 1), 60) : 20;
  const institutionCode = String(req.query.institution || "ALL").toUpperCase();
  const docType = req.query.docType || "ALL";
  const data = await adminService.getSlaEvolution({ days, institutionCode, docType });
  res.json({ ok: true, ...data });
});

exports.creerAgent = asyncHandler(async (req, res) => {
  const result = await adminService.creerAgent({
    ...req.body,
    password: DEFAULT_PASSWORD, // ✅ injecté automatiquement
    institutionId: req.body.institutionId || req.user.institutionId,
  });
  res.status(201).json(result);
});

exports.getAgents = asyncHandler(async (req, res) => {
  const institutionId = req.query.institutionId || req.user.institutionId;
  const agents = await adminService.getAgents(institutionId);
  res.json(agents);
});

exports.toggleActif = asyncHandler(async (req, res) => {
  const result = await adminService.toggleActif(req.params.userId);
  res.json(result);
});

exports.configurerInstitution = asyncHandler(async (req, res) => {
  const institutionId = req.params.institutionId || req.user.institutionId;
  const result = await adminService.configurerInstitution(institutionId, req.body);
  res.json(result);
});

exports.getStatistiques = asyncHandler(async (req, res) => {
  const institutionId = req.query.institutionId || req.user.institutionId;
  const stats = await adminService.getStatistiques(institutionId);
  res.json(stats);
});

exports.getInstitutions = asyncHandler(async (req, res) => {
  const institutions = await adminService.getInstitutions();
  res.json(institutions);
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboard();
  res.json(data);
});

// util
const H48_MS = 48 * 60 * 60 * 1000;

function addDays(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function diffHours(a, b) {
  return (a.getTime() - b.getTime()) / (1000 * 60 * 60);
}

// Statuts "terminaux" (document déjà livré ou demande close)
const TERMINAL = ["DISPONIBLE", "REJETEE", "ANNULEE"];

// ⚠️ On considère "livré" quand deliveredAt existe (comme dans ton schema)
async function computeKpis({ days = 30, institution = "ALL", docType = "ALL" }) {
  const now = new Date();

  const start = addDays(now, -Number(days));
  const prevStart = addDays(start, -Number(days));
  const prevEnd = start;

  // where commun (institution + typeDocument)
  const baseWhere = {};
  if (institution && institution !== "ALL") {
    // institution ici doit être l'ID ou le sigle ?
    // -> on part sur SIGLE (IFRI/EPAC/FSS) et on filtre via relation Institution.sigle
    baseWhere.institution = { sigle: institution };
  }
  if (docType && docType !== "ALL") {
    // mapping simple (ajuste si tu veux)
    // ATTENTION: ton enum Prisma est ATTESTATION_INSCRIPTION / RELEVE_NOTES
    const map = {
      ATTESTATION: "ATTESTATION_INSCRIPTION",
      RELEVE: "RELEVE_NOTES",
    };
    if (map[docType]) baseWhere.typeDocument = map[docType];
  }

  // 1) ACTIVE : demandes non terminales
  const active = await prisma.demande.count({
    where: {
      ...baseWhere,
      NOT: { statut: { in: TERMINAL } },
    },
  });

  // 2) OVERDUE : demandes actives dont l'âge dépasse 48h
  const overdue = await prisma.demande.count({
    where: {
      ...baseWhere,
      NOT: { statut: { in: TERMINAL } },
      createdAt: { lt: new Date(now.getTime() - H48_MS) },
    },
  });

  // 3) SLA : % des demandes livrées en <48h sur la période
  const deliveredInPeriod = await prisma.demande.findMany({
    where: {
      ...baseWhere,
      deliveredAt: { not: null, gte: start, lte: now },
    },
    select: { createdAt: true, deliveredAt: true },
  });

  const deliveredCount = deliveredInPeriod.length;
  const slaOk = deliveredInPeriod.filter(
    (d) => d.deliveredAt && (d.deliveredAt.getTime() - d.createdAt.getTime()) <= H48_MS
  ).length;

  const sla = deliveredCount ? Math.round((slaOk / deliveredCount) * 100) : 0;

  // 4) avgTimeH : moyenne de durée (création -> delivery) sur la période
  const avgTimeH =
    deliveredCount
      ? Math.round(
          deliveredInPeriod.reduce((acc, d) => acc + diffHours(d.deliveredAt, d.createdAt), 0) /
            deliveredCount
        )
      : 0;

  // ---- DELTAS (période précédente de même longueur) ----
  const prevDelivered = await prisma.demande.findMany({
    where: {
      ...baseWhere,
      deliveredAt: { not: null, gte: prevStart, lte: prevEnd },
    },
    select: { createdAt: true, deliveredAt: true },
  });

  const prevCount = prevDelivered.length;
  const prevSlaOk = prevDelivered.filter(
    (d) => d.deliveredAt && (d.deliveredAt.getTime() - d.createdAt.getTime()) <= H48_MS
  ).length;

  const prevSla = prevCount ? (prevSlaOk / prevCount) * 100 : 0;
  const prevAvg =
    prevCount
      ? prevDelivered.reduce((acc, d) => acc + diffHours(d.deliveredAt, d.createdAt), 0) / prevCount
      : 0;

  const prevOverdue = await prisma.demande.count({
    where: {
      ...baseWhere,
      NOT: { statut: { in: TERMINAL } },
      createdAt: { lt: new Date(prevEnd.getTime() - H48_MS) },
      createdAt: { gte: prevStart, lte: prevEnd }, // overdue dans cette fenêtre
    },
  });

  const prevActive = await prisma.demande.count({
    where: {
      ...baseWhere,
      NOT: { statut: { in: TERMINAL } },
      createdAt: { gte: prevStart, lte: prevEnd },
    },
  });

  // deltas en %
  const deltaPct = (cur, prev) => {
    if (prev === 0) return cur === 0 ? 0 : 100;
    return Math.round(((cur - prev) / prev) * 100);
  };

  return {
    avgTimeH,
    sla,
    slaTarget: 80,
    overdue,
    active,
    deltaAvg: deltaPct(avgTimeH, Math.round(prevAvg || 0)),
    deltaSla: deltaPct(sla, Math.round(prevSla || 0)),
    deltaOverdue: deltaPct(overdue, prevOverdue),
    deltaActive: deltaPct(active, prevActive),
  };
}

exports.getKpis = asyncHandler(async (req, res) => {
  const days = Number(req.query.days || 30);
  const institution = String(req.query.institution || "ALL").toUpperCase();
  const docType = req.query.docType || "ALL";

  const kpis = await computeKpis({ days, institution, docType });
  return res.json({ ok: true, kpis });
});