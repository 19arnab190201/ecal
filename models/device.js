const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  deviceName: {
    type: String,
    required: [true, "Please add a device name"],
    trim: true,
    maxlength: [50, "Device name cannot be more than 50 characters"],
  },
  deviceStatus: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "INACTIVE",
  },
  deviceCreatedAt: {
    type: Date,
    default: Date.now,
  },
  deviceSyncedByEspAt: {
    type: Date,
  },
  deviceSyncedByAppAt: {
    type: Date,
    default: Date.now,
  },
  deviceId: {
    type: String,
    unique: true,
  },
  deviceUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  deviceData: {
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Device location cannot be more than 100 characters"],
    },
    temperature: {
      type: Number,
    },
    humidity: {
      type: Number,
    },
    windspeed: {
      type: Number,
    },
    airquality: {
      type: String,
    },
    userTasks: {
      type: [String],
    },
    day: {
      type: Number,
    },
    date: {
      type: Number,
    },
    month: {
      type: Number,
    },
    year: {
      type: Number,
    },
    hour: {
      type: Number,
    },
    minute: {
      type: Number,
    },
    second: {
      type: Number,
    },
  },
});

module.exports = mongoose.model("Device", deviceSchema);
