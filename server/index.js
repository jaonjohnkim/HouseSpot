const express = require('express');
const async = require('async');
const request = require('request-promise');
const bodyParser = require('body-parser');
const url = require('url');
const app = express();
const statsD = require('node-statsd');
const statsDClient = new statsD({
  host: 'statsd.hostedgraphite.com',
  port: 8125,
  prefix: process.env.HOSTEDGRAPHITE_APIKEY
});

// const asyncTasks = [
//   callback => {
//     request({
//       url: "fireincident.herokuapp.com/json",
//       method: "GET",
//       qs: {
//         zipcode: ,
//         granularity: ,
//         startDate: ,
//         endDate:
//       }
//     })
//     .then(data => {
//       callback(null, data);
//     })
//     .catch(err => {
//       callback(err, null);
//     })
//   }
// ];

// app.use()
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
const formatIntoObj = data => {
  return data.reduce((acc, val) => {
    const key = Object.getOwnPropertyNames(val)[0];
    acc[key] = val[key];
    return acc;
  }, {})
}

app.get('/*', (req, res) => {
  const start = Date.now();
  statsDClient.increment('.gateway.query.all');
  // console.log('Request:', req);
  if (req.query.length === 0) {
    res.send('Gateway Server Online');
  } else {
    let response = [];
    setTimeout(() => {
      if (!res.headersSent) {
        // console.log('TIMEOUT! Anything after this is not sent:', response);
        // console.log('formatted:', formatIntoObj(response));
        try {
          res.send(formatIntoObj(response));
          statsDClient.increment('.gateway.response.timeout');
          statsDClient.increment('.gateway.response.success');
          statsDClient.timing('.gateway.response.timeout.latency_ms', Date.now() - start);
        } catch(e) {
          console.log("It's okay, we delivered, ignore");
        }
      }
    }, 2000);
    async.parallel([
      callback => {
        request({
          url: "https://fireincident.herokuapp.com/json",
          method: "GET",
          qs: {
            zipcode: req.query.zipcode,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            granularity: req.query.granularity
          }
        })
        .then(data => {
          statsDClient.increment('.gateway.fire.query.response.success');
          statsDClient.timing('.gateway.fire.query.response.success.latency_ms', Date.now() - start);
          // console.log('fire data:', data);
          const processed = {fire: JSON.parse(data)};
          response.push(processed);
          callback(null, processed);
        })
        .catch(err => {
          statsDClient.increment('.gateway.fire.query.response.fail');
          statsDClient.timing('.gateway.fire.query.response.fail.latency_ms', Date.now() - start);

          console.error('Error getting fire data:', err);
          const processed = {fire: 'error'};
          response.push(processed);
          callback(null, processed);
        })
      },
      callback => {
        request({
          url: "https://crime-spot.herokuapp.com/crime/json",
          method: "GET",
          qs: {
            zipcode: req.query.zipcode,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            granularity: req.query.granularity
          }
        })
        .then(data => {
          statsDClient.increment('.gateway.crime.query.response.success');
          statsDClient.timing('.gateway.crime.query.response.success.latency_ms', Date.now() - start);
          // console.log('crime data:', data);
          const processed = {crime: JSON.parse(data)};
          response.push(processed);
          callback(null, processed);
        })
        .catch(err => {
          statsDClient.increment('.gateway.crime.query.response.fail');
          statsDClient.timing('.gateway.crime.query.response.fail.latency_ms', Date.now() - start);
          console.error('Error getting crime data:', err);
          const processed = {crime: 'error'};
          response.push(processed);
          callback(null, processed);
        })
      },
      callback => {
        request({
          url: "https://healthinspectiondata.herokuapp.com/inspectionscore/json",
          method: "GET",
          qs: {
            zipcode: req.query.zipcode,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            granularity: req.query.granularity
          }
        })
        .then(data => {
          statsDClient.increment('.gateway.health.query.response.success');
          statsDClient.timing('.gateway.health.query.response.success.latency_ms', Date.now() - start);
          // console.log('health inspeciton data:', data);
          const processed = {healthInspection: JSON.parse(data)};
          response.push(processed);
          callback(null, processed);
        })
        .catch(err => {
          statsDClient.increment('.gateway.health.query.response.fail');
          statsDClient.timing('.gateway.health.query.response.fail.latency_ms', Date.now() - start);
          console.error('Error getting health inspection data:', err);
          const processed = {health: 'error'};
          response.push(processed);
          callback(null, processed);
        })
      },
      callback => {
        request({
          url: "http://13.57.63.47:1337/json",
          method: "GET",
          qs: {
            zipcode: req.query.zipcode,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            granularity: req.query.granularity
          }
        })
        .then(data => {
          statsDClient.increment('.gateway.house.query.response.success');
          statsDClient.timing('.gateway.house.query.response.success.latency_ms', Date.now() - start);
          // console.log('house data:', data);
          const processed = {house: JSON.parse(data)};
          response.push(processed);
          callback(null, processed);
        })
        .catch(err => {
          statsDClient.increment('.gateway.house.query.response.fail');
          statsDClient.timing('.gateway.house.query.response.fail.latency_ms', Date.now() - start);
          console.error('Error getting house data:', err);
          const processed = {house: 'error'};
          response.push(processed);
          callback(null, processed);
        })
      }
    ], (err, data) => {
      if (err) {
        console.error('Error getting data:', err);
        // response.push(err);
        // res.status(400).send(err);
      } else {
        try {
          // console.log('Gateway successfully read from the microservices, current response:', data);
          if (!res.headersSent) {
            // console.log('formatted:', formatIntoObj(data));
            res.status(200).send(formatIntoObj(data));
            statsDClient.increment('.gateway.response.success');
            statsDClient.timing('.gateway.response.success.latency_ms', Date.now() - start);
          }
        } catch(e) {
          statsDClient.increment('.gateway.response.fail');
          statsDClient.timing('.gateway.response.fail.latency_ms', Date.now() - start);
          console.log("Hmm, we timed out, one or more microservices too slow:", e);
        }
      }
    })
  }
})

app.listen(process.env.PORT || 3000, err => {
  if (err) console.error(err);
  console.log('Listening on port:', process.env.PORT || 3000);
})
