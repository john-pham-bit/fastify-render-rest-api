"use strict";

const { scryptSync } = require("crypto");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async function (fastify, opts) {
  const schema = {
    body: {
      type: "object",
      required: ["username", "password"],
      properties: {
        username: { type: "string" },
        password: { type: "string" },
      },
    },
    response: {
      "2xx": {
        type: "object",
        properties: {
          accessToken: { type: "string" },
        },
      },
      401: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  };

  fastify.post("/login", { schema }, async function (request, reply) {
    try {
      const { username } = request.body;
      let password = request.body.password;

      const supabase = this.supabase;
      const { data, error } = await supabase
        .from("users")
        .select("password, salt")
        .eq("username", username)
        .limit(1);

      if (error) {
        throw error;
      }

      if (data.length < 1) {
        return reply.status(401).send({ message: "Invalid credentials" });
      }

      // hash the password using scrypt
      const salt = data[0].salt;
      const key = data[0].password;
      password = scryptSync(password, salt, 128).toString("hex");

      if (crypto.timingSafeEqual(Buffer.from(password), Buffer.from(key))) {
        const accessToken = jwt.sign(
          { data: { username } },
          process.env.JWT_SECRET,
          { expiresIn: "10m" }
        );
        return reply.send({ accessToken });
      } else {
        return reply.status(401).send({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  });
};
