const WORKFLOW = {
  SOUMISE: {
    roles: ['SECRETAIRE_ADJOINT'],
    actions: {
      TRANSMETTRE: 'TRANSMISE_SECRETAIRE_GENERAL',
      DEMANDER_CORRECTION: 'CORRECTION_DEMANDEE'
    }
  },
  CORRECTION_DEMANDEE: {
    roles: ['ETUDIANT'],
    actions: { SOUMETTRE_CORRECTION: 'SOUMISE' }
  },
  TRANSMISE_SECRETAIRE_GENERAL: {
    roles: ['SECRETAIRE_GENERAL'],
    actions: { TRANSMETTRE: 'TRANSMISE_CHEF_DIVISION' }
  },
  TRANSMISE_CHEF_DIVISION: {
    roles: ['CHEF_DIVISION'],
    actions: {
      GENERER_DOCUMENT: 'ATTENTE_SIGNATURE_DIRECTEUR_ADJOINT',
      REJETER: 'REJETEE'
    }
  },
  ATTENTE_SIGNATURE_DIRECTEUR_ADJOINT: {
    roles: ['DIRECTEUR_ADJOINT'],
    actions: { APPROUVER: 'ATTENTE_SIGNATURE_DIRECTEUR' }
  },
  ATTENTE_SIGNATURE_DIRECTEUR: {
    roles: ['DIRECTEUR'],
    actions: { APPROUVER: 'DISPONIBLE' }
  },
  DISPONIBLE: { roles: [], actions: {} },
  REJETEE:    { roles: [], actions: {} }
};

exports.peutAgir = (role, statutActuel) => {
  const etape = WORKFLOW[statutActuel];
  return etape && etape.roles.includes(role);
};

exports.getNextStatut = (statutActuel, action) => {
  const etape = WORKFLOW[statutActuel];
  if (!etape) throw new Error(`Statut inconnu : ${statutActuel}`);
  const next = etape.actions[action];
  if (!next) throw new Error(`Action "${action}" non permise depuis "${statutActuel}"`);
  return next;
};