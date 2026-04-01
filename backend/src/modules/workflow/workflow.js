/**
 * Workflow EtuDocs — State Machine stricte
 * - Verrouille les transitions (statut + action + rôle)
 * - Fournit des helpers pour timeline / UI
 * - Donne des messages humains (UX)
 */

const WORKFLOW = Object.freeze({
  /**
   * Étudiant a soumis une demande.
   * Elle arrive chez le Secrétaire Adjoints pour vérification de complétude.
   */
  SOUMISE: {
    label: "Soumise",
    description: "Votre demande a été soumise et attend la vérification de complétude.",
    roles: ["SECRETAIRE_ADJOINT"],
    actions: {
      TRANSMETTRE: "TRANSMISE_SECRETAIRE_ADJOINT",
      DEMANDER_CORRECTION: "CORRECTION_DEMANDEE",
      REJETER: "REJETEE",
    },
  },

  /**
   * Correction demandée à l'étudiant.
   */
  CORRECTION_DEMANDEE: {
    label: "Correction demandée",
    description: "Des pièces sont manquantes ou illisibles. Veuillez corriger puis soumettre.",
    roles: ["ETUDIANT"],
    actions: {
      SOUMETTRE_CORRECTION: "SOUMISE",
      ANNULER: "ANNULEE",
    },
  },

  /**
   * Secrétaire adjoint a transmis au Secrétaire général.
   */
  TRANSMISE_SECRETAIRE_ADJOINT: {
    label: "Transmise (Secrétaire général)",
    description: "Votre demande a été transmise au Secrétaire général.",
    roles: ["SECRETAIRE_GENERAL"],
    actions: {
      TRANSMETTRE: "TRANSMISE_SECRETAIRE_GENERAL",
      REJETER: "REJETEE",
      DEMANDER_CORRECTION: "CORRECTION_DEMANDEE",
    },
  },

  /**
   * Secrétaire général a transmis au Chef de division.
   */
  TRANSMISE_SECRETAIRE_GENERAL: {
    label: "Chez Chef de division",
    description: "Votre dossier est en cours de validation des pièces justificatives.",
    roles: ["CHEF_DIVISION"],
    actions: {
      GENERER_DOCUMENT: "DOCUMENT_GENERE",
      REJETER: "REJETEE",
      DEMANDER_CORRECTION: "CORRECTION_DEMANDEE",
    },
  },

  /**
   * Document généré — attente de signature Directeur adjoint.
   */
  DOCUMENT_GENERE: {
    label: "Document généré",
    description: "Le document est généré et attend la signature du Directeur adjoint.",
    roles: ["DIRECTEUR_ADJOINT"],
    actions: {
      APPROUVER: "ATTENTE_SIGNATURE_DIRECTEUR",
      REJETER: "REJETEE",
    },
  },

  /**
   * Après signature DA, attente signature Directeur.
   */
  ATTENTE_SIGNATURE_DIRECTEUR: {
    label: "En attente signature Directeur",
    description: "Le document attend la signature finale du Directeur.",
    roles: ["DIRECTEUR"],
    actions: {
      APPROUVER: "DISPONIBLE",
      REJETER: "REJETEE",
    },
  },

  // Statuts terminaux
  DISPONIBLE: {
    label: "Disponible",
    description: "Votre document est disponible au téléchargement.",
    terminal: true,
    roles: [],
    actions: {},
  },

  REJETEE: {
    label: "Rejetée",
    description: "Votre demande a été rejetée.",
    terminal: true,
    roles: [],
    actions: {},
  },

  ANNULEE: {
    label: "Annulée",
    description: "La demande a été annulée par l'étudiant.",
    terminal: true,
    roles: [],
    actions: {},
  },
});

const TERMINAL_STATUSES = new Set(
  Object.entries(WORKFLOW)
    .filter(([, v]) => v.terminal)
    .map(([k]) => k)
);

/**
 * Vérifie que le statut existe.
 */
function assertStatut(statut) {
  if (!WORKFLOW[statut]) throw new Error(`Statut inconnu : ${statut}`);
}

/**
 * Vérifie qu'une action est autorisée depuis un statut.
 */
function assertAction(statutActuel, action) {
  const etape = WORKFLOW[statutActuel];
  const next = etape?.actions?.[action];
  if (!next) {
    const allowed = Object.keys(etape?.actions || {}).join(", ") || "(aucune)";
    throw new Error(
      `Action "${action}" non permise depuis "${statutActuel}". Actions permises: ${allowed}`
    );
  }
  return next;
}

/**
 * Vérifie que le rôle est autorisé à exécuter une action depuis un statut.
 * -> C'est LA fonction à utiliser côté backend avant de muter un statut.
 */
function assertPermission({ role, statutActuel, action }) {
  assertStatut(statutActuel);
  if (TERMINAL_STATUSES.has(statutActuel)) {
    throw new Error(`Statut terminal "${statutActuel}" : aucune action possible.`);
  }

  const etape = WORKFLOW[statutActuel];
  if (!etape.roles.includes(role)) {
    throw new Error(
      `Rôle "${role}" non autorisé à agir depuis "${statutActuel}". Rôles autorisés: ${etape.roles.join(", ")}`
    );
  }

  // Vérifie l'action existe
  assertAction(statutActuel, action);

  return true;
}

/**
 * Retourne vrai si le rôle peut agir depuis ce statut (au moins une action).
 */
function peutAgir(role, statutActuel) {
  const etape = WORKFLOW[statutActuel];
  return !!etape && !TERMINAL_STATUSES.has(statutActuel) && etape.roles.includes(role);
}

/**
 * Retourne vrai si le rôle peut faire CETTE action depuis ce statut.
 */
function peutFaireAction(role, statutActuel, action) {
  const etape = WORKFLOW[statutActuel];
  if (!etape) return false;
  if (TERMINAL_STATUSES.has(statutActuel)) return false;
  if (!etape.roles.includes(role)) return false;
  return !!etape.actions?.[action];
}

/**
 * Donne le prochain statut en vérifiant la permission (rôle + action).
 */
function getNextStatut({ role, statutActuel, action }) {
  assertPermission({ role, statutActuel, action });
  return WORKFLOW[statutActuel].actions[action];
}

/**
 * Pour le frontend : label / description.
 */
function getStatutMeta(statut) {
  assertStatut(statut);
  const { label, description, terminal } = WORKFLOW[statut];
  return { statut, label, description, terminal: !!terminal };
}

/**
 * Pour la timeline UI : liste ordonnée des étapes “normales” du parcours.
 * (les statuts alternatifs comme CORRECTION_DEMANDEE, REJETEE, ANNULEE sortent du flow)
 */
function getTimelineSteps() {
  return [
    "SOUMISE",
    "TRANSMISE_SECRETAIRE_ADJOINT",
    "TRANSMISE_SECRETAIRE_GENERAL",
    "DOCUMENT_GENERE",
    "ATTENTE_SIGNATURE_DIRECTEUR",
    "DISPONIBLE",
  ].map(getStatutMeta);
}

/**
 * Pour l'UI : calcule la progression sur la timeline.
 * Retourne l'index de l'étape actuelle si elle est dans le flow, sinon -1.
 */
function getTimelineIndex(statutActuel) {
  const steps = getTimelineSteps().map((s) => s.statut);
  return steps.indexOf(statutActuel);
}

/**
 * Pour debug/monitoring : liste des actions autorisées pour un rôle à un statut.
 */
function getAllowedActions(role, statutActuel) {
  const etape = WORKFLOW[statutActuel];
  if (!etape) return [];
  if (TERMINAL_STATUSES.has(statutActuel)) return [];
  if (!etape.roles.includes(role)) return [];
  return Object.keys(etape.actions || {});
}

module.exports = {
  WORKFLOW,
  TERMINAL_STATUSES: Array.from(TERMINAL_STATUSES),

  // checks
  peutAgir,
  peutFaireAction,
  assertPermission,

  // transitions
  getNextStatut,

  // ui helpers
  getStatutMeta,
  getTimelineSteps,
  getTimelineIndex,

  // debugging
  getAllowedActions,
};