// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const path = require('path')

fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    //prefix: '/public', 
})

// Declare a route
fastify.get('/api', async (request, reply) => {
    return { hello: 'world', and: 'all' }
})

// Run the server!
const start = async () => {
    try {
        await fastify.listen({ port: 3000 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()