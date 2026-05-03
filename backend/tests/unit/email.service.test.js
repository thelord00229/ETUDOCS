const emailService = require("../src/services/email.service");

// Mock nodemailer
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
  })),
}));

// Mock ejs
jest.mock("ejs", () => ({
  renderFile: jest.fn(),
}));

// Mock path
jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
}));

describe("Email Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set test env
    process.env.FRONTEND_URL = "http://localhost:3000";
    process.env.NODE_ENV = "test";
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