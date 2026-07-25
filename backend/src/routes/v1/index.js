const express = require("express");

const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/dashboard", require("./dashboard"));
router.use("/income", require("./income"));
router.use("/expense", require("./expense"));
router.use("/budget", require("./budget"));
router.use("/loans", require("./loans"));
router.use("/credit-cards", require("./credit-cards"));
router.use("/investments", require("./investments"));
router.use("/reports", require("./reports"));
router.use("/settings", require("./settings"));
router.use(require("./health"));

module.exports = router;
