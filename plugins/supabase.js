'use strict'

const fp = require('fastify-plugin')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
  fastify.decorate('supabase', supabase)
})
