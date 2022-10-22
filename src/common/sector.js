const sectorSide = 1024
const getSector = (_x, _y) => {
    const coords = [_x, _y].map(f => parseFloat(f))
    const sector = coords.map(f => Math.floor(f / sectorSide).toString()).join('_')
    return sector
}
module.exports = { getSector, sectorSide }