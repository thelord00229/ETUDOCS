const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const ctrl = require("./reclamation.controller");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
  fileFilter: (req, file, cb) => {
    if (!String(file.mimetype || "").startsWith("image/")) {
      return cb(new Error("Seules les images sont autorisees."));
    }
    cb(null, true);
  },
});

router.use(auth);

router.get("/stats", role("SUPER_ADMIN"), ctrl.stats);
router.get(
  "/",
  role("SECRETAIRE_GENERAL", "CHEF_DIVISION", "SUPER_ADMIN"),
  ctrl.list
);
router.get("/mes-reclamations", role("ETUDIANT"), ctrl.mesReclamations);
router.post("/", role("ETUDIANT"), upload.array("piecesJointes", 3), ctrl.create);
router.get("/:id", ctrl.detail);
router.patch(
  "/:id/prendre-en-charge",
  role("SECRETAIRE_GENERAL", "CHEF_DIVISION"),
  ctrl.prendreEnCharge
);
router.patch(
  "/:id/resoudre",
  role("SECRETAIRE_GENERAL", "CHEF_DIVISION"),
  ctrl.resoudre
);

module.exports = router;
