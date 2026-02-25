const WORKFLOW = {
  // Niveau 1: Étudiant soumet sa demande
  SOUMISE: {
    roles: ['SECRETAIRE_ADJOINT'],
    actions: {
      TRANSMETTRE: 'TRANSMISE_SECRETAIRE_ADJOINT', // Transmet au secrétaire général
      DEMANDER_CORRECTION: 'CORRECTION_DEMANDEE'
    }
  },
  
  CORRECTION_DEMANDEE: {
    roles: ['ETUDIANT'],
    actions: { 
      SOUMETTRE_CORRECTION: 'SOUMISE' 
    }
  },
  
  // Niveau 2: Secrétaire adjoint a transmis au secrétaire général
  TRANSMISE_SECRETAIRE_ADJOINT: {
    roles: ['SECRETAIRE_GENERAL'],
    actions: { 
      TRANSMETTRE: 'TRANSMISE_SECRETAIRE_GENERAL' // Transmet au chef de division
    }
  },
  
  // Niveau 3: Secrétaire général a transmis au chef de division
  TRANSMISE_SECRETAIRE_GENERAL: {
    roles: ['CHEF_DIVISION'],
    actions: {
      GENERER_DOCUMENT: 'DOCUMENT_GENERE', // Génère le document après validation des pièces
      REJETER: 'REJETEE'
    }
  },
  
  // Niveau 3 (suite): Document généré, prêt pour signature
  DOCUMENT_GENERE: {
    roles: ['DIRECTEUR_ADJOINT'],
    actions: {
      APPROUVER: 'ATTENTE_SIGNATURE_DIRECTEUR'  // ✅ après DA, on attend le Directeur
    }
  },
  
  // Niveau 4: Directeur adjoint a signé
  ATTENTE_SIGNATURE_DIRECTEUR: {
    roles: ['DIRECTEUR'],
    actions: {
      APPROUVER: 'DISPONIBLE'  // ✅ document final disponible
    }
  },
  
  // Niveau 5: Document disponible pour l'étudiant
  DISPONIBLE: { 
    roles: [], 
    actions: {} 
  },
  
  // Rejet
  REJETEE: { 
    roles: [], 
    actions: {} 
  }
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