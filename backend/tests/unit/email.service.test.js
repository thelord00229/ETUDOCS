// Ensure env vars before module load so email.service picks nodemailer transport
process.env.SMTP_HOST = "smtp.example";
process.env.SMTP_PORT = "587";
process.env.SMTP_USER = "user";
process.env.SMTP_PASS = "pass";
process.env.MAIL_FROM = '"EtuDocs" <noreply@etudocs.uac.bj>';

// Mock nodemailer
jest.mock("nodemailer", () => {
  const transportMock = { sendMail: jest.fn() };
  return { createTransport: jest.fn(() => transportMock) };
});

// Mock ejs
jest.mock("ejs", () => ({
  renderFile: jest.fn(),
}));

// Mock path but preserve native functions like resolve used by dotenv
jest.mock("path", () => {
  const realPath = jest.requireActual("path");
  return {
    ...realPath,
    join: jest.fn((...args) => args.join("/")),
  };
});

// Import the module under test AFTER mocks to avoid early require side-effects
const emailService = require("../../src/services/email.service");

describe("Email Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set test env
    process.env.FRONTEND_URL = "http://localhost:3000";
    process.env.NODE_ENV = "test";
    // Ensure transport uses mocked nodemailer
    process.env.SMTP_HOST = "smtp.example";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "user";
    process.env.SMTP_PASS = "pass";
  });

  describe("sendVerificationEmail", () => {
    it("should send verification email with correct template", async () => {
      const mockRender = require("ejs").renderFile;
      mockRender.mockResolvedValue("<html>Verification</html>");

      const mockSendMail = require("nodemailer").createTransport().sendMail;
      mockSendMail.mockResolvedValue(true);

      await emailService.sendVerificationEmail("test@example.com", "token123");

      expect(mockRender).toHaveBeenCalledWith(
        expect.stringContaining("verification.ejs"),
        { link: "http://localhost:3000/auth/verify/token123?email=test%40example.com" }
      );
      expect(mockSendMail).toHaveBeenCalledWith({
        from: '"EtuDocs" <noreply@etudocs.uac.bj>',
        to: "test@example.com",
        subject: "Vérifiez votre email — EtuDocs",
        html: "<html>Verification</html>",
      });
    });
  });

  describe("sendDemandeConfirmee", () => {
    it("should send confirmation email with correct data", async () => {
      const mockRender = require("ejs").renderFile;
      mockRender.mockResolvedValue("<html>Confirmation</html>");

      const mockSendMail = require("nodemailer").createTransport().sendMail;
      mockSendMail.mockResolvedValue(true);

      await emailService.sendDemandeConfirmee("student@example.com", "Jean", "REF123", "ATTESTATION_INSCRIPTION");

      expect(mockRender).toHaveBeenCalledWith(
        expect.stringContaining("demande-confirmee.ejs"),
        {
          prenom: "Jean",
          reference: "REF123",
          typeDocument: "ATTESTATION_INSCRIPTION",
          dashboardUrl: "http://localhost:3000/dashboard",
        }
      );
    });
  });

  describe("sendAgentNotification", () => {
    it("should not send email if nbDossiers is 0", async () => {
      const mockSendMail = require("nodemailer").createTransport().sendMail;

      await emailService.sendAgentNotification("agent@example.com", "Marie", "CHEF_DIVISION", 0);

      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("should send notification for single dossier", async () => {
      const mockRender = require("ejs").renderFile;
      mockRender.mockResolvedValue("<html>Notification</html>");

      const mockSendMail = require("nodemailer").createTransport().sendMail;
      mockSendMail.mockResolvedValue(true);

      await emailService.sendAgentNotification("agent@example.com", "Marie", "CHEF_DIVISION", 1);

      expect(mockRender).toHaveBeenCalledWith(
        expect.stringContaining("agent-notification.ejs"),
        {
          prenom: "Marie",
          sujet: "Nouveau dossier à traiter — EtuDocs",
          message: "Un nouveau dossier vous a été assigné.",
          nbDossiers: 1,
          dashboardUrl: "http://localhost:3000/dashboard",
        }
      );
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("should send reset email with the code and correct subject", async () => {
      const mockRender = require("ejs").renderFile;
      mockRender.mockResolvedValue("<html>Reset</html>");

      const mockSendMail = require("nodemailer").createTransport().sendMail;
      mockSendMail.mockResolvedValue(true);

      await emailService.sendPasswordResetEmail("test@example.com", "K7P2QM");

      expect(mockRender).toHaveBeenCalledWith(
        expect.stringContaining("password-reset.ejs"),
        { code: "K7P2QM" }
      );
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: "Code de réinitialisation — EtuDocs",
          html: "<html>Reset</html>",
        })
      );
    });
  });

  describe("sendDemandeRejetee", () => {
    it("should send rejection email with motif", async () => {
      const mockRender = require("ejs").renderFile;
      mockRender.mockResolvedValue("<html>Rejet</html>");

      const mockSendMail = require("nodemailer").createTransport().sendMail;
      mockSendMail.mockResolvedValue(true);

      await emailService.sendDemandeRejetee("student@example.com", "Jean", "ATTESTATION_INSCRIPTION", "Dossier incomplet");

      expect(mockRender).toHaveBeenCalledWith(
        expect.stringContaining("demande-rejetee.ejs"),
        {
          prenom: "Jean",
          typeDocument: "ATTESTATION_INSCRIPTION",
          motif: "Dossier incomplet",
          dashboardUrl: "http://localhost:3000/dashboard",
        }
      );
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ subject: "Demande refusée — EtuDocs" })
      );
    });
  });

  describe("sendDocumentDisponible", () => {
    it("should send document-ready email", async () => {
      const mockRender = require("ejs").renderFile;
      mockRender.mockResolvedValue("<html>Dispo</html>");

      const mockSendMail = require("nodemailer").createTransport().sendMail;
      mockSendMail.mockResolvedValue(true);

      await emailService.sendDocumentDisponible("student@example.com", "Jean", "ATTESTATION_INSCRIPTION");

      expect(mockRender).toHaveBeenCalledWith(
        expect.stringContaining("document-disponible.ejs"),
        {
          prenom: "Jean",
          typeDocument: "ATTESTATION_INSCRIPTION",
          documents: [],
          reclamationUrl: "http://localhost:3000/dashboardEtu/reclamations",
        }
      );
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ subject: "Votre document est prêt — EtuDocs" })
      );
    });
  });

  describe("sendWelcomeAgent", () => {
    it("should send welcome email with agent credentials", async () => {
      const mockRender = require("ejs").renderFile;
      mockRender.mockResolvedValue("<html>Welcome</html>");

      const mockSendMail = require("nodemailer").createTransport().sendMail;
      mockSendMail.mockResolvedValue(true);

      await emailService.sendWelcomeAgent("agent@example.com", "Marie", "Doe", "Temp123!");

      expect(mockRender).toHaveBeenCalledWith(
        expect.stringContaining("welcome-agent.ejs"),
        {
          prenom: "Marie",
          nom: "Doe",
          email: "agent@example.com",
          password: "Temp123!",
          loginUrl: "http://localhost:3000/login",
        }
      );
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "agent@example.com",
          subject: "Bienvenue sur EtuDocs — Vos identifiants de connexion",
        })
      );
    });
  });

  describe("sendCustomMessage", () => {
    it("should send a custom message with given subject", async () => {
      const mockRender = require("ejs").renderFile;
      mockRender.mockResolvedValue("<html>Custom</html>");

      const mockSendMail = require("nodemailer").createTransport().sendMail;
      mockSendMail.mockResolvedValue(true);

      await emailService.sendCustomMessage("agent@example.com", "Rappel", "Ligne 1\nLigne 2");

      expect(mockRender).toHaveBeenCalledWith(
        expect.stringContaining("custom-message.ejs"),
        { subject: "Rappel", body: "Ligne 1\nLigne 2" }
      );
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "agent@example.com",
          subject: "Rappel",
          html: "<html>Custom</html>",
        })
      );
    });
  });

  describe("Error handling", () => {
    it("should log error but not throw on send failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockSendMail = require("nodemailer").createTransport().sendMail;
      mockSendMail.mockRejectedValue(new Error("SMTP Error"));

      const mockRender = require("ejs").renderFile;
      mockRender.mockResolvedValue("<html>Test</html>");

      await expect(emailService.sendVerificationEmail("test@example.com", "token")).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[EMAIL ERROR]")
      );

      consoleSpy.mockRestore();
    });
  });
});
