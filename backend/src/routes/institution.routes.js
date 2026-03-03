// backend/src/routes/institution.routes.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// GET /api/institutions  → liste institutions (id, nom, sigle)
router.get("/", async (req, res, next) => {
  try {
    const institutions = await prisma.institution.findMany({
      select: { id: true, nom: true, sigle: true },
      orderBy: { nom: "asc" },
    });
    return res.json(institutions);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;