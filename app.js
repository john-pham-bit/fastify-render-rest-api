"use strict";

const path = require("node:path");
const AutoLoad = require("@fastify/autoload");
const axios = require("axios");
require("dotenv").config();

// Pass --options via CLI arguments in command to enable these options.
const options = {};

module.exports = async function (fastify, opts) {
  const tokenResponse = await axios.post(
    "https://auth.idp.hashicorp.com/oauth2/token",
    {
      client_id: process.env.HCP_CLIENT_ID,
      client_secret: process.env.HCP_CLIENT_SECRET,
      grant_type: "client_credentials",
      audience: "https://api.hashicorp.cloud",
    }
  );

  const access_token = tokenResponse.data.access_token;

  const secretResponse = await axios.get(process.env.HCP_APP_URL, {
    headers: { Authorization: "Bearer " + access_token },
  });

  secretResponse.data.secrets.forEach((secret) => {
    opts[secret.name] = secret.version.value;
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });
};

module.exports.options = options;
