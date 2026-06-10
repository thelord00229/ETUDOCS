const prisma = require("../../config/prisma");

exports.createNotification = async ({
  utilisateurId,
  type,
  titre,
  message,
  lien = null,
  demandeId = null,
}) => {
  try {
    return await prisma.notification.create({
      data: { utilisateurId, type, titre, message, lien, demandeId },
    });
  } catch (e) {
    console.log("[NOTIF SKIPPED]", e.message);
  }
};

exports.createMany = async (notifications) => {
  try {
    return await prisma.notification.createMany({ data: notifications });
  } catch (e) {
    console.log("[NOTIF_MANY SKIPPED]", e.message);
  }
};

exports.getNotifications = async (utilisateurId) => {
  return prisma.notification.findMany({
    where: { utilisateurId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};

exports.markAllRead = async (utilisateurId) => {
  return prisma.notification.updateMany({
    where: { utilisateurId, lue: false },
    data: { lue: true },
  });
};

exports.deleteOne = async (id, utilisateurId) => {
  return prisma.notification.deleteMany({
    where: { id, utilisateurId },
  });
};

exports.deleteAll = async (utilisateurId) => {
  return prisma.notification.deleteMany({
    where: { utilisateurId },
  });
};
