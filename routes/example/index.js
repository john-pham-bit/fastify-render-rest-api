'use strict'

module.exports = async function (fastify, opts) {
  const schema = {
    response: {
      200: {
        type: 'object',
        properties: {
          key1: { type: 'string' }
        }
      }
    }
  }

  fastify.get('/', { schema }, async function (request, reply) {
    return { key1: "value" }
  })
}
