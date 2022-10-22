// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const path = require('path')
const appDir = path.resolve(path.join(__dirname, '../../'))
const { v4: uuidv4 } = require('uuid');

const CyclicDb = require("cyclic-dynamodb")
const db = CyclicDb("elegant-fish-attireCyclicDB")

const messagesCollection = db.collection("messages")
const { getSector } = require('../common/sector.js')

const writeMessage = async (message) => {
    const id = uuidv4()
    const { x, y, msg } = message
    return messagesCollection.set(id, {
        x: x.toString(),
        y: y.toString(),
        msg: msg,
        sector: getSector(x, y)
    }, {
        $index: ['sector']
    })
}
const findMessageBySector = async sector => {
    return await messagesCollection.index('sector').find(sector)
}
const deleteSector = async sector => {
    const result = await findMessageBySector(sector)
    return Promise.all(result.results.map(item => item.delete()))
}
const wrapItemForClient = dbItem => {
    return { id: dbItem.key, ...dbItem.props }
}

fastify.register(require('@fastify/static'), {
    root: path.join(appDir, "dist/"),
    cacheControl: false
})

fastify.get('/sector/:sector', async (request, reply) => {
    const sector = request?.params?.sector
    if (sector) {
        const r = await findMessageBySector(sector)
        return r.results.map(wrapItemForClient)
    }
})
fastify.post('/bloc', async (request, reply) => {

    const body = request.body || {}
    const x = parseFloat(body.x)
    const y = parseFloat(body.y)
    const msg = `${body.msg}`.substring(0, 42)

    const check = (isNaN(x) === false) && (isNaN(y) === false) && (msg.length > 0)
    if (check) {
        const dbItem = await writeMessage({ x, y, msg })
        return wrapItemForClient(dbItem)
    }
})

const defaultBlocs = `
   place your
   own
   message bloc
   click "add" !
   click somewhere !
   write your message !
   click ok !
`.trim().split("\n").map((msg, i) => ([40 + i * 20, 40 + i * 20, msg.trim()])).map(([x, y, msg]) => ({ x, y, msg }))

const DRY_RUN = false
const start = async () => {
    if (DRY_RUN) {
        await deleteSector(getSector(0, 0))
    }
    const result = await findMessageBySector(getSector(0, 0))
    if (result.results.length === 0) {
        await Promise.all(defaultBlocs.map(writeMessage))
    }
    try {
        await fastify.listen({ port: 3000 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()