const express = require("express");
const router = express.Router();

const {
  createDevice,
  updateDevice,
  deleteDevice,
  getDevice,
  syncDevice,
  connectDevice,
  syncEcal,
} = require("../controllers/deviceController");

router.route("/create-device").post(createDevice);
router.route("/update-device").put(updateDevice);
router.route("/delete-device/:deviceId").delete(deleteDevice);
router.route("/get-device/:deviceId").get(getDevice);
router.route("/connect-device").post(connectDevice);
router.route("/sync-device").post(syncDevice);
router.route("/syncecal/:deviceId").get(syncEcal);

module.exports = router;
