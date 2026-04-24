require("dotenv").config();
const prisma = require("../../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../../services/email.service");
const validatePassword = require("./security/validatePassword");
const { ETUDIANT } = require("../../constants/roles");

const normalize = (v) => String(v || "").trim().toUpperCase();

const REQUIRE_EMAIL_VERIFICATION =
  String(process.env.REQUIRE_EMAIL_VERIFICATION ?? "true").toLowerCase() !==
  "false";

// ✅ Token JWT (on ajoute institutionCode)
const genToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
      institutionId: user.institutionId ?? null,
      institutionCode: user.institution?.sigle || null,
      service: user.service ?? null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

async function resolveInstitutionId({ institutionId, institutionSigle }) {
  const raw = (institutionId ?? institutionSigle ?? "").toString().trim();
  if (!raw) return null;

  const value = raw.trim();
  const sigle = normalize(value);

  const inst = await prisma.institution.findFirst({
    where: {
      OR: [{ id: value }, { sigle }, { nom: { equals: value, mode: "insensitive" } }],
    },
    select: { id: true, nom: true, sigle: true },
  });

  if (!inst) {
    const err = new Error(
      `Institution inconnue: "${value}". Envoie un UUID valide ou un sigle existant (ex: IFRI).`
    );
    err.statusCode = 400;
    throw err;
  }

  return inst.id;
}

exports.register = async ({
  nom,
  prenom,
  email,
  password,
  numeroEtudiant,
  institutionId,
  institutionSigle,
  filiere,
  niveau,
}) => {
  if (!nom || !prenom || !email || !password) {
    const err = new Error("Champs requis: nom, prenom, email, password.");
    err.statusCode = 400;
    throw err;
  }

  validatePassword(password);

  const cleanEmail = String(email).trim().toLowerCase();

  const existing = await prisma.utilisateur.findUnique({
    where: { email: cleanEmail },
    select: { id: true },
  });

  if (existing) {
    const err = new Error("Cet email est déjà utilisé");
    err.statusCode = 400;
    throw err;
  }

  if (numeroEtudiant) {
    const already = await prisma.utilisateur.findFirst({
      where: { numeroEtudiant: String(numeroEtudiant).trim() },
      select: { id: true },
    });

    if (already) {
      const err = new Error("Ce numéro étudiant est déjà utilisé.");
      err.statusCode = 400;
      throw err;
    }
  }

  const resolvedInstitutionId = await resolveInstitutionId({
    institutionId,
    institutionSigle,
  });

  // ✅ Institution obligatoire (MVP multi-institutions)
  if (!resolvedInstitutionId) {
    const err = new Error(
      "Institution obligatoire. Fournis institutionId ou institutionSigle (IFRI/EPAC/FSS)."
    );
    err.statusCode = 400;
    throw err;
  }

  const hash = await bcrypt.hash(password, 12);

  const tokenVerification = REQUIRE_EMAIL_VERIFICATION
    ? crypto.randomBytes(32).toString("hex")
    : null;

  const created = await prisma.utilisateur.create({
    data: {
      nom: String(nom).trim(),
      prenom: String(prenom).trim(),
      email: cleanEmail,
      password: hash,
      role: ETUDIANT,
      numeroEtudiant: numeroEtudiant ? String(numeroEtudiant).trim() : null,
      filiere: filiere ? String(filiere).trim() : null,
      niveau: niveau ? String(niveau).trim() : null,
      institutionId: resolvedInstitutionId,
      tokenVerification: tokenVerification ? await bcrypt.hash(tokenVerification, 12) : null,
      emailVerifie: REQUIRE_EMAIL_VERIFICATION ? false : true,
      actif: REQUIRE_EMAIL_VERIFICATION ? false : true,
    },
    select: { id: true, email: true },
  });

  if (REQUIRE_EMAIL_VERIFICATION && tokenVerification) {
    try {
      await emailService.sendVerificationEmail(
        created.email,
        tokenVerification
      );
    } catch (e) {
      console.log("[EMAIL SKIPPED]", e.message);
    }
  }

  return {
    message: REQUIRE_EMAIL_VERIFICATION
      ? "Compte créé. Vérifiez votre email."
      : "Compte créé (mode DEV). Vous pouvez vous connecter directement.",
  };
};

exports.login = async ({ email, password }) => {
  const cleanEmail = String(email || "").trim().toLowerCase();

  const user = await prisma.utilisateur.findUnique({
    where: { email: cleanEmail },
    include: {
      institution: {
        select: { id: true, nom: true, sigle: true, logoUrl: true },
      },
    },
  });

  if (!user) {
    // Simuler le temps bcrypt pour éviter les timing attacks
    await bcrypt.compare(password, "$2a$12$fakehashfakehashfakehashfakehash");
    const err = new Error("Email ou mot de passe incorrect");
    err.statusCode = 401;
    throw err;
  }

  if (REQUIRE_EMAIL_VERIFICATION && !user.emailVerifie) {
    const err = new Error("Email non vérifié");
    err.statusCode = 403;
    throw err;
  }

  if (REQUIRE_EMAIL_VERIFICATION && !user.actif) {
    const err = new Error("Compte désactivé");
    err.statusCode = 403;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error("Email ou mot de passe incorrect");
    err.statusCode = 401;
    throw err;
  }

  const token = genToken(user);

  const institutionCode = user.institution?.sigle || null;

  // ✅ Le front reçoit tout pour adapter l'UI directement
  return {
    token,
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      service: user.service,
      institutionId: user.institutionId,
      institutionCode,
      numeroEtudiant: user.numeroEtudiant,
      filiere: user.filiere,
      niveau: user.niveau,
      institution: user.institution,
    },
  };
};

exports.verifyEmail = async (token, email) => {
  const cleanEmail = String(email || "").trim().toLowerCase();
  
  const user = await prisma.utilisateur.findUnique({
    where: { email: cleanEmail },
    select: { id: true, tokenVerification: true, emailVerifie: true },
  });

  if (!user || !user.tokenVerification) {
    const err = new Error("Token invalide");
    err.statusCode = 400;
    throw err;
  }

  const isValid = await bcrypt.compare(token, user.tokenVerification);
  if (!isValid) {
    const err = new Error("Token invalide");
    err.statusCode = 400;
    throw err;
  }

  await prisma.utilisateur.update({
    where: { id: user.id },
    data: { emailVerifie: true, actif: true, tokenVerification: null },
  });

  return { message: "Email vérifié. Vous pouvez vous connecter." };
};

exports.requestPasswordReset = async (email) => {
  const cleanEmail = String(email || "").trim().toLowerCase();

  const user = await prisma.utilisateur.findUnique({
    where: { email: cleanEmail },
    select: { id: true, email: true },
  });

  if (!user) return { message: "Si cet email existe, un lien a été envoyé." };

  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(token, 12);

  await prisma.utilisateur.update({
    where: { id: user.id },
    data: {
      tokenResetPassword: hashedToken,
      tokenResetExpiry: new Date(Date.now() + 3600000),
    },
  });

  try {
    await emailService.sendPasswordResetEmail(cleanEmail, token);
  } catch (e) {
    console.log("[EMAIL SKIPPED]", e.message);
  }

  return { message: "Si cet email existe, un lien a été envoyé." };
};

exports.resetPassword = async (token, newPassword, email) => {
  validatePassword(newPassword);

  const cleanEmail = String(email || "").trim().toLowerCase();

  const user = await prisma.utilisateur.findUnique({
    where: { email: cleanEmail },
    select: { id: true, tokenResetPassword: true, tokenResetExpiry: true },
  });

  if (!user || !user.tokenResetPassword || user.tokenResetExpiry < new Date()) {
    const err = new Error("Token invalide ou expiré");
    err.statusCode = 400;
    throw err;
  }

  const isValid = await bcrypt.compare(token, user.tokenResetPassword);
  if (!isValid) {
    const err = new Error("Token invalide ou expiré");
    err.statusCode = 400;
    throw err;
  }

  const hash = await bcrypt.hash(newPassword, 12);

  await prisma.utilisateur.update({
    where: { id: user.id },
    data: { password: hash, tokenResetPassword: null, tokenResetExpiry: null },
  });

  return { message: "Mot de passe réinitialisé." };
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
  validatePassword(newPassword);

  const user = await prisma.utilisateur.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) {
    const err = new Error("Utilisateur introuvable");
    err.statusCode = 404;
    throw err;
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    const err = new Error("Mot de passe actuel incorrect");
    err.statusCode = 400;
    throw err;
  }

  const hash = await bcrypt.hash(newPassword, 12);

  await prisma.utilisateur.update({
    where: { id: user.id },
    data: { password: hash },
  });

  return { message: "Mot de passe modifié avec succès" };
};