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
          active: { type: "string" },
          recovery: { type: "string" },
          cancel: { type: "string" },
          damage: { type: "string" },
          guard: { type: "string" },
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
          .select(
            "character_name, input, move_name, startup, active, recovery, cancel, damage, guard, on_hit, on_block"
          )
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
      required: ["moves"],
      properties: {
        moves: {
          type: "array",
          maxItems: 200,
          items: {
            type: "object",
            properties: {
              input: { type: "string" },
              move_name: { type: "string" },
              aliases: {
                type: "array",
                maxItems: 50,
                items: { type: "string" },
              },
              startup: { type: "string" },
              active: { type: "string" },
              recovery: { type: "string" },
              cancel: { type: "string" },
              damage: { type: "string" },
              guard: { type: "string" },
              on_hit: { type: "string" },
              on_block: { type: "string" },
            },
          },
        },
      },
      additionalProperties: false,
    },
    params: {
      character_name: { type: "string" },
      input: { type: "string" },
    },
  };

  fastify.put(
    "/:character_name",
    {
      schema: putSchema,
      onRequest: fastify.auth([fastify.authenticate]),
    },
    async function (request, reply) {
      try {
        const character_name = request.params.character_name;
        const moves = request.body.moves;

        const move_data_rows = [];

        moves.forEach((move) => {
          move_data_rows.push({
            character_name: character_name,
            input: move.input,
            move_name: move.move_name,
            aliases: move.aliases,
            startup: move.startup,
            active: move.active,
            recovery: move.recovery,
            cancel: move.cancel,
            damage: move.damage,
            guard: move.guard,
            on_hit: move.on_hit,
            on_block: move.on_block,
          });
        });

        const { error } = await fastify.supabase
          .from("move_data")
          .upsert(move_data_rows);

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
