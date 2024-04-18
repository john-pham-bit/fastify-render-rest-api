"use strict";

const { randomBytes, scryptSync } = require("crypto");

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
          message: { type: "string" },
        },
      },
    },
  };

  fastify.post("/", { schema }, async function (request, reply) {
    try {
      const { username } = request.body;
      let password = request.body.password;

      // hash the password using scrypt
      const salt = randomBytes(16).toString("hex");
      password = scryptSync(password, salt, 128).toString("hex");

      const supabase = this.supabase;
      const { error } = await supabase
        .from("users")
        .insert({ username, password, salt });

      if (error) {
        throw error;
      }

      reply.send({ message: "User successfully created." });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  });
};
