const express = require('express')
const router = express.Router()
const db = require('sqlite')

/* GET home page. */
router.get('/', async function (req, res) {
  const routes = await db.all('SELECT * FROM routes')

  res.render('index', { title: 'ChamMoove', routes })
})

router.get('/route/:id', async function (req, res) {
  const id = req.params.id
  const tripsOut = {}

  const trips = await db.all('SELECT * FROM trips WHERE route_id = ? ORDER BY route_id, trip_id', [id])
  const allTrips = []
  trips.forEach(function (trip) {
    trip.times = []
    tripsOut[trip.trip_id] = trip
    allTrips.push(trip.trip_id)
  })

  const times = await db.all(`
    SELECT stop_times.*, stops.stop_name FROM stop_times
    JOIN stops ON stops.stop_id = stop_times.stop_id
    WHERE trip_id IN ('${allTrips.join(`','`)}')
    ORDER BY trip_id, stop_sequence`)
  times.forEach(function (time) {
    tripsOut[time.trip_id].times.push(time)
  })

  const data = {}
  for (const tripId in tripsOut) {
    var trip = tripsOut[tripId]
    if (!data[trip.trip_headsign]) {
      data[trip.trip_headsign] = []
    }
    data[trip.trip_headsign].push(trip)
  }

  res.render('route', { title: `Line: ${id}`, data })
})

module.exports = router
