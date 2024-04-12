const Device = require("../models/device");
const axios = require("axios");

exports.createDevice = async (req, res) => {
  const { deviceName } = req.body;

  const deviceId = Math.random().toString(36).substring(7);
  //generate a unique device id here

  const device = await Device.create({
    deviceName,
    deviceId,
  });

  res.status(201).json({
    status: "success",
    data: {
      device,
    },
  });
};

exports.updateDevice = async (req, res) => {
  const data = req.body;

  const deviceId = data.deviceId;

  const device = await Device.findOneAndUpdate(
    { deviceId },
    { $set: data },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      device,
    },
  });
};

exports.deleteDevice = async (req, res) => {
  const { deviceId } = req.params;

  await Device.findOneAndDelete({ deviceId });

  res.status(204).json({
    status: "success",
    message: "Device deleted successfully (" + deviceId + ")",
  });
};

exports.getDevice = async (req, res) => {
  const { deviceId } = req.params;

  const device = await Device.findOne({ deviceId });

  res.status(200).json({
    status: "success",
    data: {
      device,
    },
  });
};

exports.connectDevice = async (req, res) => {
  const { deviceId, userId } = req.body;
  const device = await Device.findOne({
    deviceId,
  });

  if (!device) {
    return res.status(404).json({
      status: "fail",
      message: "Device not found",
    });
  }

  device.deviceUser = userId;
  device.deviceStatus = "ACTIVE";

  await device.save();

  res.status(200).json({
    status: "success",
    data: {
      device,
    },
  });
};

exports.syncDevice = async (req, res) => {
  const { deviceId, syncedBy } = req.body;
  console.log(deviceId, syncedBy);

  const device = await Device.findOne({ deviceId });

  if (!device) {
    return res.status(404).json({
      status: "fail",
      message: "Device not found",
    });
  }

  if (device.deviceStatus === "INACTIVE" || !device.deviceUser) {
    return res.status(403).json({
      status: "fail",
      message: "Device not connected",
    });
  }

  if (syncedBy === "ESP") {
    device.deviceSyncedByEspAt = Date.now();
  } else if (syncedBy === "APP") {
    device.deviceSyncedByAppAt = Date.now();
  }
  const data = req.body.deviceData;
  console.log(data);
  const d = new Date();
  device.deviceData.day = d.getDay();
  device.deviceData.date = d.getDate();
  device.deviceData.month = d.getMonth() + 1;
  device.deviceData.year = d.getFullYear();
  device.deviceData.hour = d.getHours();
  device.deviceData.minute = d.getMinutes();
  device.deviceData.second = d.getSeconds();

  let lattitude, longitude, location;

  //if synced by esp, fetch location from database

  if (syncedBy === "ESP") {
    lattitude = device.deviceData.lattitude;
    longitude = device.deviceData.longitude;
    location = device.deviceData.location;
  } else {
    lattitude = data.lattitude;
    longitude = data.longitude;
    location = data.location;
  }

  //fetch weather data from openweather api

  console.log(lattitude, longitude, location);

  try {
    const weatherData = await axios.get(
      `http://api.openweathermap.org/data/3.0/onecall?lat=${lattitude}&lon=${longitude}&exclude=minutely,hourly&appid=${process.env.OPEN_WEATHER_API_KEY}`
    );

    const airqualityData = await axios.get(
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lattitude}&lon=${longitude}&appid=${process.env.OPEN_WEATHER_API_KEY}`
    );
    // console.log("weather", weatherData.data);
    // console.log("air q", airqualityData.data.list[0].main.aqi);

    // Possible values: 1, 2, 3, 4, 5. Where 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor.

    const { temp, humidity, wind_speed } = weatherData.data.current;
    const airquality = ["Good", "Fair", "Moderate", "Poor", "Very Poor"][
      parseInt(airqualityData.data.list[0].main.aqi) - 1
    ];

    device.deviceData.location = location;
    device.deviceData.lattitude = lattitude;
    device.deviceData.longitude = longitude;
    device.deviceData.temperature = temp;
    device.deviceData.humidity = humidity;
    device.deviceData.windspeed = wind_speed;
    device.deviceData.airquality = airquality;
  } catch (error) {
    console.log(error);
  }

  console.log(device.deviceData);

  await device.save();

  res.status(200).json({
    status: "success",
    data: device,
  });
};

exports.syncEcal = async (req, res) => {
  const { deviceId } = req.params;
  let iconData = {};
  const device = await Device.findOne({ deviceId });

  if (!device) {
    return res.status(404).json({
      status: "fail",
      message: "Device not found",
    });
  }

  const data = device.deviceData;
  const d = new Date();

  // Convert to IST
  const istDate = new Date(
    d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  data.day = istDate.getDay();
  data.date = istDate.getDate();
  data.month = istDate.getMonth() + 1;
  data.year = istDate.getFullYear();
  data.hour = istDate.getHours();
  data.minute = istDate.getMinutes();
  data.second = istDate.getSeconds();

  let lattitude, longitude, location;

  lattitude = device.deviceData.lattitude;
  longitude = device.deviceData.longitude;
  location = device.deviceData.location;

  //fetch location from database
  //fetch weather data from openweather api

  try {
    console.log(lattitude, longitude, location);
    const weatherData = await axios.get(
      `http://api.openweathermap.org/data/3.0/onecall?lat=${lattitude}&lon=${longitude}&exclude=minutely,hourly&appid=${process.env.OPEN_WEATHER_API_KEY}`
    );

    const airqualityData = await axios.get(
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lattitude}&lon=${longitude}&appid=${process.env.OPEN_WEATHER_API_KEY}`
    );
    console.log("weather", weatherData.data);
    // console.log("air q", airqualityData.data.list[0].main.aqi);

    // Possible values: 1, 2, 3, 4, 5. Where 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor.

    const { temp, humidity, wind_speed } = weatherData.data.current;
    const airquality = ["Good", "Fair", "Moderate", "Poor", "Very Poor"][
      parseInt(airqualityData.data.list[0].main.aqi) - 1
    ];

    device.deviceData.location = location;
    device.deviceData.temperature = temp;
    device.deviceData.humidity = humidity;
    device.deviceData.windspeed = wind_speed;
    device.deviceData.airquality = airquality;

    const dailyForecast = weatherData.data.daily;

    // Iterate through daily forecast data to find min-max temperature
    let minTemp = Infinity;
    let maxTemp = -Infinity;

    dailyForecast.forEach((day) => {
      const tempMin = day.temp.min;
      const tempMax = day.temp.max;

      minTemp = Math.min(minTemp, tempMin);
      maxTemp = Math.max(maxTemp, tempMax);
    });
    device.deviceData.minTemp = minTemp;
    device.deviceData.maxTemp = maxTemp;
    // console.log(weatherData.data);

    const { weather, dt, sunrise, sunset, clouds, wind_gust } =
      weatherData.data.current;

    // OpenWeatherMap indicates sun is up with d otherwise n for night
    const day = weather[0].icon.endsWith("d");
    // sun is out if current time is after sunrise but before sunset
    const sun = dt >= sunrise && dt < sunset;
    // partly cloudy / partly sunny
    const cloudy = clouds > 60.25;
    // windy conditions
    const windy = wind_speed >= 32.2 || wind_gust >= 40.2;

    iconData = {
      day,
      sun,
      cloudy,
      windy,
      moon: !day && !sun,
    };

    console.log(device.deviceData);
  } catch (error) {
    // console.log(error);
  }

  await device.save();

  res.status(200).json({
    status: "success",
    data: {
      ...device._doc,
      iconData,
    },
  });
};
