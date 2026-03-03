const express = require("express");
const router = express.Router();
const prisma = require("../../config/prisma");

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const ctrl = require("./admin.controller");

// N1..N6 => statuts (adaptés à ton enum actuel)
const STEPS = [
  { step: "N1", statut: "SOUMISE" },
  { step: "N2", statut: "TRANSMISE_SECRETAIRE_ADJOINT" },
  { step: "N3", statut: "TRANSMISE_SECRETAIRE_GENERAL" },
  { step: "N4", statut: "DOCUMENT_GENERE" },
  { step: "N5", statut: "ATTENTE_SIGNATURE_DIRECTEUR" },
  { step: "N6", statut: "DISPONIBLE" },
];

// Helper: heures écoulées depuis une date
const hoursSince = (d) => (Date.now() - new Date(d).getTime()) / 36e5;

router.get(
  "/radar",
  auth,
  role("SUPER_ADMIN"),
  async (req, res, next) => {
   try {
    // 1) institutions
    const institutions = await prisma.institution.findMany({
      select: { id: true, sigle: true },
      orderBy: { sigle: "asc" },
    });

    // 2) demandes actives (on ignore ANNULEE/REJETEE)
    const demandes = await prisma.demande.findMany({
      where: { statut: { notIn: ["ANNULEE", "REJETEE"] } },
      select: { statut: true, institutionId: true, updatedAt: true },
    });

    // Prépare index institutions
    const instById = new Map(institutions.map((i) => [i.id, (i.sigle || "").toUpperCase()]));

    // Init heatmap
    const heatmap = {};
    const instList = institutions.map((i) => (i.sigle || "").toUpperCase()).filter(Boolean);
    for (const sigle of instList) {
      heatmap[sigle] = {};
      for (const s of STEPS) {
        heatmap[sigle][s.step] = { p90: 0, pending: 0 };
      }
    }

    // Accumule
    for (const d of demandes) {
      const sigle = instById.get(d.institutionId);
      if (!sigle || !heatmap[sigle]) continue;

      const stepObj = STEPS.find((x) => x.statut === d.statut);
      if (!stepObj) continue;

      const h = hoursSince(d.updatedAt);

      heatmap[sigle][stepObj.step].pending += 1;

      // Niveau hackathon: on prend le MAX observé (plus simple, très parlant)
      heatmap[sigle][stepObj.step].p90 = Math.max(heatmap[sigle][stepObj.step].p90, h);
    }

    return res.json({
      institutions: instList,
      steps: STEPS.map((x) => x.step),
      heatmap,
      mode: "MAX_UPDATEDAT_HOURS",
    });
  } catch (e) {
    return next(e);
  }
});

// KPI cards (réel)
router.get("/kpis", auth, role("SUPER_ADMIN"), ctrl.getKpis);

module.exports = router;