const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const ctrl = require("./notification.controller");

router.use(auth);

router.get("/", ctrl.getNotifications);
router.patch("/read-all", ctrl.markAllRead);
router.delete("/", ctrl.deleteAll);
router.delete("/:id", ctrl.deleteOne);

module.exports = router;
