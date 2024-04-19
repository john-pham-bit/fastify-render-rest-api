"use strict";

module.exports = async function (fastify, opts) {
  const getSchema = {
    params: {
      type: "object",
      properties: {
        character_name: { type: "string" },
      },
    },
    query: {
      type: "object",
      additionalProperties: false,
      properties: {
        input: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          character_name: { type: "string" },
          input: { type: "string" },
          move_name: { type: "string" },
          startup: { type: "string" },
          on_hit: { type: "string" },
          on_block: { type: "string" },
        },
      },
    },
  };

  fastify.get(
    "/:character_name",
    {
      schema: getSchema,
    },
    async function (request, reply) {
      try {
        const { character_name } = request.params;
        const { input } = request.query;

        const supabase = this.supabase;
        const { data, error } = await supabase
          .from("move_data")
          .select("character_name, input, move_name, startup, on_hit, on_block")
          .eq("character_name", character_name)
          .eq("input", input)
          .limit(1);

        if (error) {
          throw error;
        }

        return data[0]; // Return the first row
      } catch (error) {
        console.error(error);
        reply.send(error);
      }
    }
  );

  const putSchema = {
    body: {
      type: "object",
      required: ["move_name", "startup"],
      properties: {
        move_name: { type: "string" },
        startup: { type: "string" },
        on_hit: { type: "string" },
        on_block: { type: "string" },
      },
      additionalProperties: false,
    },
    params: {
      character_name: { type: "string" },
      input: { type: "string" },
    },
  };

  fastify.put(
    "/:character_name/:input",
    {
      schema: putSchema,
      onRequest: [fastify.authenticate],
    },
    async function (request, reply) {
      try {
        const characterName = request.params.character_name;
        const input = request.params.input;
        const data = request.body;

        const { error } = await fastify.supabase.from("move_data").upsert([
          {
            character_name: characterName,
            input: input,
            move_name: data.move_name,
            startup: data.startup,
            on_hit: data.on_hit,
            on_block: data.on_block,
          },
        ]);

        if (error) {
          console.error(error);
          return reply
            .status(500)
            .send({ message: "Error inserting or updating data" });
        }

        return reply.send({ message: "Data inserted or updated successfully" });
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Internal server error" });
      }
    }
  );
};
