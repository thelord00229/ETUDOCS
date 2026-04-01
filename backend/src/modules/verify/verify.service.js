const documentService = require("../document/document.service");

exports.verifier = async (reference) => {
  const doc = await documentService.verifier(reference);

  if (!doc) {
    return { valide: false, message: "Document non reconnu" };
  }

  const u = doc.demande.utilisateur;
  const nom = String(u.nom || "");
  const prenom = String(u.prenom || "");

  const masked =
    nom.length <= 2
      ? `${prenom} ${nom.charAt(0)}*`
      : `${prenom} ${nom.charAt(0)}${"*".repeat(nom.length - 2)}${nom.slice(-1)}`;

  return {
    valide: true,
    reference: doc.reference,
    typeDocument: doc.demande.typeDocument,
    institution: doc.demande.institution.nom,
    sigle: doc.demande.institution.sigle,
    dateGeneration: doc.createdAt,
    nomMasque: masked,
  };
};