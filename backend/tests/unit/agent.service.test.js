// Mock prisma (singleton) et le service email pour isoler la logique métier
jest.mock("../../src/config/prisma", () => ({
  utilisateur: { findUnique: jest.fn(), create: jest.fn() },
  institution: { findUnique: jest.fn() },
}));

jest.mock("../../src/services/email.service", () => ({
  sendWelcomeAgent: jest.fn(),
  sendCustomMessage: jest.fn(),
}));

const prisma = require("../../src/config/prisma");
const emailService = require("../../src/services/email.service");
const agentService = require("../../src/modules/agent/agent.service");

describe("Agent Service — routage email", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createAgent → mail de bienvenue", () => {
    const baseInput = {
      nom: "Doe",
      prenom: "Marie",
      email: "agent@example.com",
      role: "SECRETAIRE_ADJOINT",
      institutionId: "inst-1",
    };

    const setupHappyPath = () => {
      prisma.utilisateur.findUnique.mockResolvedValue(null); // pas de doublon
      prisma.institution.findUnique.mockResolvedValue({ id: "inst-1" });
      prisma.utilisateur.create.mockResolvedValue({
        id: "agent-1",
        nom: "Doe",
        prenom: "Marie",
        email: "agent@example.com",
        role: "SECRETAIRE_ADJOINT",
      });
    };

    it("envoie le mail de bienvenue via le service central avec les bons arguments", async () => {
      setupHappyPath();
      emailService.sendWelcomeAgent.mockResolvedValue();

      const agent = await agentService.createAgent(baseInput);

      expect(emailService.sendWelcomeAgent).toHaveBeenCalledWith(
        "agent@example.com",
        "Marie",
        "Doe",
        expect.any(String) // mot de passe temporaire
      );
      expect(agent).toHaveProperty("id", "agent-1");
    });

    it("ne fait pas échouer la création si l'envoi du mail échoue (non bloquant)", async () => {
      setupHappyPath();
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      emailService.sendWelcomeAgent.mockRejectedValue(new Error("template manquant"));

      await expect(agentService.createAgent(baseInput)).resolves.toHaveProperty("id", "agent-1");

      consoleSpy.mockRestore();
    });
  });

  describe("sendMailToAgent", () => {
    it("délègue au service central sendCustomMessage", async () => {
      prisma.utilisateur.findUnique.mockResolvedValue({ id: "agent-1", email: "agent@example.com" });
      emailService.sendCustomMessage.mockResolvedValue();

      await agentService.sendMailToAgent("agent-1", "Objet", "Corps du message");

      expect(emailService.sendCustomMessage).toHaveBeenCalledWith(
        "agent@example.com",
        "Objet",
        "Corps du message"
      );
    });

    it("lève AGENT_NOT_FOUND si l'agent n'existe pas", async () => {
      prisma.utilisateur.findUnique.mockResolvedValue(null);

      await expect(agentService.sendMailToAgent("inconnu", "Objet", "Corps"))
        .rejects.toThrow("AGENT_NOT_FOUND");
      expect(emailService.sendCustomMessage).not.toHaveBeenCalled();
    });
  });
});
