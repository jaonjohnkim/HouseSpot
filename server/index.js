const express = require('express');
const async = require('async');
const Prommise = require('bluebird');
// const request = require('request-promise');
const request = require('request');
const app = express();
const os = require('os');
const osUtil = require('os-utils');
const statsD = require('node-statsd');
const statsDClient = new statsD({
  host: 'statsd.hostedgraphite.com',
  port: 8125,
  prefix: process.env.HOSTEDGRAPHITE_APIKEY
});

const gatewayNumber = 'one';

const formatIntoObj = data => {
  return data.reduce((acc, val) => {
    const key = Object.getOwnPropertyNames(val)[0];
    acc[key] = val[key];
    return acc;
  }, {})
}

app.get('/*', (req, res) => {
  console.log('Request com')
  osUtil.cpuUsage((v) => {
    statsDClient.gauge('.gateway.'+ gatewayNumber +'.cpu.percent', v);
  })
  statsDClient.gauge('.gateway.'+ gatewayNumber +'.memory.used.percent', ((os.totalmem() - os.freemem()) / os.totalmem()));
  statsDClient.gauge('.gateway.'+ gatewayNumber +'.memory.used.bytes', os.totalmem() - os.freemem());
  statsDClient.gauge('.gateway.'+ gatewayNumber +'.memory.free.bytes', os.freemem());

  const start = Date.now();
  statsDClient.increment('.gateway.'+ gatewayNumber +'.query.all');
  // console.log('Request:', req);
  if (req.query.length === 0) {
    res.send('Gateway Server Online');
  } else {
    let response = [];
    const SLA = setTimeout(() => {
      if (!res.headersSent) {
        // console.log('TIMEOUT! Anything after this is not sent:', response);
        // console.log('formatted:', formatIntoObj(response));
        try {
          res.send(formatIntoObj(response));
          statsDClient.increment('.gateway.'+ gatewayNumber +'.response.timeout');
          statsDClient.increment('.gateway.'+ gatewayNumber +'.response.success');
          statsDClient.timing('.gateway.'+ gatewayNumber +'.response.timeout.latency_ms', Date.now() - start);
          // try {
          //   global.fire.abort();
          // } catch(e) {}
          // try {
          //   global.crime.abort();
          // } catch(e) {}
          // try {
          //   global.health.abort();
          // } catch(e) {}
          // try {
          //   global.house.abort();
          // } catch(e) {}
        } catch(e) {
          // console.log("It's okay, we delivered, ignore");
        }
      }
    }, 200);

    // const requests = [
    //   () => {
    //     global.fire = request({
    //       // url: "https://fireincident.herokuapp.com/json",
    //       url: "http://13.57.114.167:3000/json",
    //       method: "GET",
    //       qs: {
    //         zipcode: req.query.zipcode,
    //         startDate: req.query.startDate,
    //         endDate: req.query.endDate,
    //         granularity: req.query.granularity
    //       }
    //     })
    //     .then(data => {
    //       statsDClient.increment('.gateway.'+ gatewayNumber +'.fire.query.response.success');
    //       statsDClient.timing('.gateway.'+ gatewayNumber +'.fire.query.response.success.latency_ms', Date.now() - start);
    //       // console.log('fire data:', data);
    //       const processed = {fire: JSON.parse(data)};
    //       response.push(processed);
    //       return processed;
    //     })
    //     .catch(err => {
    //       statsDClient.increment('.gateway.'+ gatewayNumber +'.fire.query.response.fail');
    //       statsDClient.timing('.gateway.'+ gatewayNumber +'.fire.query.response.fail.latency_ms', Date.now() - start);
    //
    //       console.error('Error getting fire data:', err);
    //       const processed = {fire: 'error'};
    //       response.push(processed);
    //       return processed;
    //     });
    //     return global.fire
    //   },
    //   () => {
    //     global.house = request({
    //       url: "http://13.57.63.47:1337/json",
    //       method: "GET",
    //       qs: {
    //         zipcode: req.query.zipcode,
    //         startDate: req.query.startDate,
    //         endDate: req.query.endDate,
    //         granularity: req.query.granularity
    //       }
    //     })
    //     .then(data => {
    //       statsDClient.increment('.gateway.'+ gatewayNumber +'.house.query.response.success');
    //       statsDClient.timing('.gateway.'+ gatewayNumber +'.house.query.response.success.latency_ms', Date.now() - start);
    //       // console.log('house data:', data);
    //       const processed = {house: JSON.parse(data)};
    //       response.push(processed);
    //       return processed;
    //     })
    //     .catch(err => {
    //       statsDClient.increment('.gateway.'+ gatewayNumber +'.house.query.response.fail');
    //       statsDClient.timing('.gateway.'+ gatewayNumber +'.house.query.response.fail.latency_ms', Date.now() - start);
    //       console.error('Error getting house data:', err);
    //       const processed = {house: 'error'};
    //       response.push(processed);
    //       return processed;
    //     })
    //     return global.house;
    //   }
    // ];
    //
    // Promise.all(requests).then(data => {
    //   try {
    //     // console.log('Gateway successfully read from the microservices, current response:', data);
    //     if (!res.headersSent) {
    //       // console.log('formatted:', formatIntoObj(data));
    //       res.status(200).send(formatIntoObj(data));
    //       clearTimeout(SLA);
    //       statsDClient.increment('.gateway.'+ gatewayNumber +'.response.success');
    //       statsDClient.timing('.gateway.'+ gatewayNumber +'.response.success.latency_ms', Date.now() - start);
    //     }
    //   } catch(e) {
    //     statsDClient.increment('.gateway.'+ gatewayNumber +'.response.fail');
    //     statsDClient.timing('.gateway.'+ gatewayNumber +'.response.fail.latency_ms', Date.now() - start);
    //     console.log("Hmm, we timed out, one or more microservices too slow:", e);
    //   }
    // })

    // async.parallel([
    //   callback => {
    //     global.fire = request({
    //       // url: "https://fireincident.herokuapp.com/json",
    //       url: "http://13.57.114.167:3000/json",
    //       method: "GET",
    //       qs: {
    //         zipcode: req.query.zipcode,
    //         startDate: req.query.startDate,
    //         endDate: req.query.endDate,
    //         granularity: req.query.granularity
    //       }
    //     })
    //     .then(data => {
    //       statsDClient.increment('.gateway.'+ gatewayNumber +'.fire.query.response.success');
    //       statsDClient.timing('.gateway.'+ gatewayNumber +'.fire.query.response.success.latency_ms', Date.now() - start);
    //       // console.log('fire data:', data);
    //       const processed = {fire: JSON.parse(data)};
    //       response.push(processed);
    //       callback(null, processed);
    //     })
    //     .catch(err => {
    //       statsDClient.increment('.gateway.'+ gatewayNumber +'.fire.query.response.fail');
    //       statsDClient.timing('.gateway.'+ gatewayNumber +'.fire.query.response.fail.latency_ms', Date.now() - start);
    //
    //       console.error('Error getting fire data:', err);
    //       const processed = {fire: 'error'};
    //       response.push(processed);
    //       callback(null, processed);
    //     })
    //   },
    //   callback => {
    //     global.crime = request({
    //       // url: "https://crime-spot.herokuapp.com/crime/json",
    //       url: "http://13.57.91.80:3000/json",
    //       method: "GET",
    //       qs: {
    //         zipcode: req.query.zipcode,
    //         startDate: req.query.startDate,
    //         endDate: req.query.endDate,
    //         granularity: req.query.granularity
    //       }
    //     })
    //     .then(data => {
    //       statsDClient.increment('.gateway.'+ gatewayNumber +'.crime.query.response.success');
    //       statsDClient.timing('.gateway.'+ gatewayNumber +'.crime.query.response.success.latency_ms', Date.now() - start);
    //       // console.log('crime data:', data);
    //       const processed = {crime: JSON.parse(data)};
    //       response.push(processed);
    //       callback(null, processed);
    //     })
    //     .catch(err => {
    //       statsDClient.increment('.gateway.'+ gatewayNumber +'.crime.query.response.fail');
    //       statsDClient.timing('.gateway.'+ gatewayNumber +'.crime.query.response.fail.latency_ms', Date.now() - start);
    //       console.error('Error getting crime data:', err);
    //       const processed = {crime: 'error'};
    //       response.push(processed);
    //       callback(null, processed);
    //     })
    //   },
    //   callback => {
    //     global.health = request({
    //       // url: "https://healthinspectiondata.herokuapp.com/inspectionscore/json",
    //       url: "http://52.9.19.99:3000/json",
    //       method: "GET",
    //       qs: {
    //         zipcode: req.query.zipcode,
    //         startDate: req.query.startDate,
    //         endDate: req.query.endDate,
    //         granularity: req.query.granularity
    //       }
    //     })
    //     .then(data => {
    //       statsDClient.increment('.gateway.'+ gatewayNumber +'.health.query.response.success');
    //       statsDClient.timing('.gateway.'+ gatewayNumber +'.health.query.response.success.latency_ms', Date.now() - start);
    //       // console.log('health inspeciton data:', data);
    //       const processed = {healthInspection: JSON.parse(data)};
    //       response.push(processed);
    //       callback(null, processed);
    //     })
    //     .catch(err => {
    //       statsDClient.increment('.gateway.'+ gatewayNumber +'.health.query.response.fail');
    //       statsDClient.timing('.gateway.'+ gatewayNumber +'.health.query.response.fail.latency_ms', Date.now() - start);
    //       console.error('Error getting health inspection data:', err);
    //       const processed = {health: 'error'};
    //       response.push(processed);
    //       callback(null, processed);
    //     })
    //   },
    //   callback => {
    //     global.house = request({
    //       url: "http://13.57.63.47:1337/json",
    //       method: "GET",
    //       qs: {
    //         zipcode: req.query.zipcode,
    //         startDate: req.query.startDate,
    //         endDate: req.query.endDate,
    //         granularity: req.query.granularity
    //       }
    //     })
    //     .then(data => {
    //       statsDClient.increment('.gateway.'+ gatewayNumber +'.house.query.response.success');
    //       statsDClient.timing('.gateway.'+ gatewayNumber +'.house.query.response.success.latency_ms', Date.now() - start);
    //       // console.log('house data:', data);
    //       const processed = {house: JSON.parse(data)};
    //       response.push(processed);
    //       callback(null, processed);
    //     })
    //     .catch(err => {
    //       statsDClient.increment('.gateway.'+ gatewayNumber +'.house.query.response.fail');
    //       statsDClient.timing('.gateway.'+ gatewayNumber +'.house.query.response.fail.latency_ms', Date.now() - start);
    //       console.error('Error getting house data:', err);
    //       const processed = {house: 'error'};
    //       response.push(processed);
    //       callback(null, processed);
    //     })
    //   }
    // ], (err, data) => {
    //   if (err) {
    //     console.error('Error getting data:', err);
    //     // response.push(err);
    //     // res.status(400).send(err);
    //   } else {
    //     try {
    //       // console.log('Gateway successfully read from the microservices, current response:', data);
    //       if (!res.headersSent) {
    //         // console.log('formatted:', formatIntoObj(data));
    //         res.status(200).send(formatIntoObj(data));
    //         clearTimeout(SLA);
    //         statsDClient.increment('.gateway.'+ gatewayNumber +'.response.success');
    //         statsDClient.timing('.gateway.'+ gatewayNumber +'.response.success.latency_ms', Date.now() - start);
    //       }
    //     } catch(e) {
    //       statsDClient.increment('.gateway.'+ gatewayNumber +'.response.fail');
    //       statsDClient.timing('.gateway.'+ gatewayNumber +'.response.fail.latency_ms', Date.now() - start);
    //       console.log("Hmm, we timed out, one or more microservices too slow:", e);
    //     }
    //   }
    // })


    const links = [
      // url: "https://fireincident.herokuapp.com/json",
      "http://13.57.114.167:3000/json",
      // "https://crime-spot.herokuapp.com/crime/json",
      "http://13.57.91.80:3000/json",
      // "https://healthinspectiondata.herokuapp.com/inspectionscore/json",
      "http://52.9.19.99:3000/json",
      "http://13.57.63.47:1337/json"
    ];
    const microservices = [
      'fire',
      'crime',
      'health',
      'house'
    ];
    for (let i = 0; i < links.length; i++) {
      request({
        url: links[i],
        method: "GET",
        qs: {
          zipcode: req.query.zipcode,
          startDate: req.query.startDate,
          endDate: req.query.endDate,
          granularity: req.query.granularity
        }
      }, (error, data, body) => {
        if (error) {
          statsDClient.increment('.gateway.' + gatewayNumber + '.' + microservices[i] + '.query.response.fail');
          statsDClient.timing('.gateway.'+ gatewayNumber + '.' + microservices[i] + '.query.response.fail.latency_ms', Date.now() - start);
          console.error('Error getting house data:', err);
          let processed = {};
          processed[microservices[i]] = 'error';
          response.push(processed);
          if (response.length === 4 && !res.headersSent) {
            try {
              res.status(200).send(formatIntoObj(response));
              clearTimeout(SLA);
              statsDClient.increment('.gateway.'+ gatewayNumber +'.response.success');
              statsDClient.timing('.gateway.'+ gatewayNumber +'.response.success.latency_ms', Date.now() - start);
            } catch(e) {
              statsDClient.increment('.gateway.'+ gatewayNumber +'.response.fail');
              statsDClient.timing('.gateway.'+ gatewayNumber +'.response.fail.latency_ms', Date.now() - start);
              console.log("Hmm, we timed out, one or more microservices too slow:", e);
            }
          }
        } else if (data) {
          statsDClient.increment('.gateway.' + gatewayNumber + '.' + microservices[i] + '.query.response.success');
          statsDClient.timing('.gateway.'+ gatewayNumber + '.' + microservices[i] + '.query.response.success.latency_ms', Date.now() - start);
          let processed = {};
          processed[microservices[i]] = JSON.parse(data);
          response.push(processed);
          if (response.length === 4 && !res.headersSent) {
            try {
              res.status(200).send(formatIntoObj(response));
              clearTimeout(SLA);
              statsDClient.increment('.gateway.'+ gatewayNumber +'.response.success');
              statsDClient.timing('.gateway.'+ gatewayNumber +'.response.success.latency_ms', Date.now() - start);
            } catch(e) {
              statsDClient.increment('.gateway.'+ gatewayNumber +'.response.fail');
              statsDClient.timing('.gateway.'+ gatewayNumber +'.response.fail.latency_ms', Date.now() - start);
              console.log("Hmm, we timed out, one or more microservices too slow:", e);
            }
          }
        } // end of if error else if data
      }) // end of request
    } // end of for loop
  }
})

app.listen(process.env.PORT || 3000, err => {
  if (err) console.error(err);
  console.log('Listening on port:', process.env.PORT || 3000);
})
