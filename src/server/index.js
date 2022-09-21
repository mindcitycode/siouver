// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const path = require('path')
const appDir = path.resolve(path.join(__dirname, '../../'))

console.log(appDir)
fastify.register(require('@fastify/static'), {
    root: path.join(appDir, "dist/"),
    cacheControl: false
    //prefix: '/public', 
})

// Declare a route
fastify.get('/api', async (request, reply) => {
    return { hello: 'world', and: 'all' }
})
const blocs = new Array(10).fill(0).map((_, id) => {
    const x = Math.random() * 800
    const y = Math.random() * 800
    const msg = `ah${Math.random()}`
    return [id, x, y, msg]
})
console.log(blocs)
fastify.get('/blocs', async (request, reply) => {
    return blocs
})
fastify.post('/bloc', async (request, reply) => {
    const body = request.body
    const x = parseFloat(body[0])
    const y = parseFloat(body[1])
    const msg = `${body[2]}`.substring(0,42)
    const id = blocs.length
    const bloc = [id, x, y, msg]
    console.log(bloc)
    blocs.push(bloc)
    return bloc
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