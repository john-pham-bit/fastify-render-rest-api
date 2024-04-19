"use strict";

const fp = require("fastify-plugin");
require("dotenv").config();

module.exports = fp(
  async function (fastify, opts) {
    fastify.register(require("@fastify/jwt"), {
      secret: process.env.JWT_SECRET,
    });

    fastify.decorate("authenticate", async function (request, reply) {
      try {
        await request.jwtVerify();
      } catch (error) {
        reply.send(error);
      }
    });
  },
  { name: "jwt-handler" }
);