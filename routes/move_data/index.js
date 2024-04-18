"use strict";

module.exports = async function (fastify, opts) {
  const schema = {
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

  fastify.get("/:character_name", { schema }, async function (request, reply) {
    try {
      const { character_name } = request.params;
      const { input } = request.query;

      const supabase = this.supabase; // Assuming you have injected Supabase client into Fastify
      const { data, error } = await supabase
        .from("move_data")
        .select("character_name, input, move_name, startup, on_hit, on_block")
        .eq("character_name", character_name)
        .eq("input", input)
        .limit(1);

      if (error) {
        throw new Error(error);
      }

      return data[0]; // Return the first row
    } catch (error) {
      reply.send(error);
    }
  });
};
