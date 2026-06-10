const notifService = require("./notification.service");

exports.getNotifications = async (req, res, next) => {
  try {
    const notifs = await notifService.getNotifications(req.user.id);
    res.json(notifs);
  } catch (e) {
    next(e);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await notifService.markAllRead(req.user.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

exports.deleteOne = async (req, res, next) => {
  try {
    await notifService.deleteOne(req.params.id, req.user.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    await notifService.deleteAll(req.user.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};
