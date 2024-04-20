"use strict";

const fp = require("fastify-plugin");
const { createClient } = require("@supabase/supabase-js");

module.exports = fp(async function (fastify, opts) {
  const supabase = createClient(opts["SUPABASE_URL"], opts["SUPABASE_KEY"]);
  supabase.auth.signInWithPassword({
    email: opts["SUPABASE_EMAIL"],
    password: opts["SUPABASE_PASSWORD"],
  });
  fastify.decorate("supabase", supabase);
});
