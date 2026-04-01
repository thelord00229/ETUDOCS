const fs = require("fs");
const asyncHandler = require("../../utils/asyncHandler");
const documentService = require("./document.service");
const { toSafeAbsolutePath } = require("../../utils/fileUtils");


exports.telecharger = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  const result = await documentService.telecharger(reference, req.user.id);

  if (result?.error) {
    return res.status(result.error.code).json({ message: result.error.message });
  }

  const absPath = toSafeAbsolutePath(result.urlPdf);
  if (!absPath || !fs.existsSync(absPath)) {
    return res.status(404).json({ message: "Fichier PDF introuvable sur le serveur" });
  }

  return res.download(absPath, `${reference}.pdf`);
});

exports.preview = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  const doc = await documentService.preview(reference);

  if (!doc) return res.status(404).json({ message: "Document introuvable" });

  const absPath = toSafeAbsolutePath(doc.urlPdf);
  if (!absPath || !fs.existsSync(absPath)) {
    return res.status(404).json({ message: "Fichier PDF introuvable sur le serveur" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${reference}.pdf"`);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  fs.createReadStream(absPath).pipe(res);
});

exports.supprimer = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const result = await documentService.supprimer(reference, req.user.id, req.user.role);

  if (result?.error) {
    return res.status(result.error.code).json({ message: result.error.message });
  }

  if (result.absPath && fs.existsSync(result.absPath)) {
    try { fs.unlinkSync(result.absPath); } catch {}
  }

  res.json({ success: true, message: "Document supprimé" });
});

exports.verifier = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  const doc = await documentService.verifier(reference);

  if (!doc) return res.json({ valide: false, message: "Document non reconnu" });

  const u = doc.demande.utilisateur;
  const nom = String(u.nom || "");
  const prenom = String(u.prenom || "");
  const masked =
    nom.length <= 2
      ? `${prenom} ${nom.charAt(0)}*`
      : `${prenom} ${nom.charAt(0)}${"*".repeat(nom.length - 2)}${nom.slice(-1)}`;

  res.json({
    valide: true,
    reference: doc.reference,
    typeDocument: doc.demande.typeDocument,
    institution: doc.demande.institution.nom,
    sigle: doc.demande.institution.sigle,
    dateGeneration: doc.createdAt,
    nomMasque: masked,
  });
});

exports.avancerParReference = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  const action = String(req.body?.action || "").trim().toUpperCase();

  if (!reference) return res.status(400).json({ message: "reference requise" });
  if (!action) return res.status(400).json({ message: "action requise" });

  const allowed = new Set(["APPROUVER", "REJETER"]);
  if (!allowed.has(action)) {
    return res.status(400).json({ message: "action invalide (APPROUVER | REJETER)" });
  }

  const result = await documentService.avancerStatut(
    reference,
    action,
    req.user.role,
    req.user.institutionId
  );

  if (result?.error) {
    return res.status(result.error.code).json({ message: result.error.message });
  }

  return res.json(result);
});