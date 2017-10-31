const express = require('express');
const async = require('async');
const request = require('request-promise');
const bodyParser = require('body-parser');
const url = require('url');
const app = express();

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

app.get('/*', (req, res) => {
  // console.log('Request:', req);
  if (req.query.length === 0) {
    res.send('Gateway Server Online');
  } else {
    let response = [];
    setTimeout(() => {
      if (!res.headersSent) {
        console.log('TIMEOUT! Anything after this is not sent:', response);
        try {
          res.send(response);
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
            granularity: req.query.granularity,
            startDate: req.query.startDate,
            endDate: req.query.endDate
          }
        })
        .then(data => {
          console.log('fire data:', data);
          const processed = {fire: JSON.parse(data)};
          response.push(processed);
          callback(null, processed);
        })
        .catch(err => {
          console.error('Error getting fire data:', err);
          const processed = {fire: 'error'};
          response.push(processed);
          callback(null, processed);
        })
      },
      callback => {
        request({
          url: "https://crime-spot.herokuapp.com/crime/json",
          method: "POST",
          qs: {
            zipcode: req.query.zipcode,
            granularity: req.query.granularity,
            startDate: req.query.startDate,
            endDate: req.query.endDate
          }
        })
        .then(data => {
          console.log('crime data:', data);
          const processed = {crime: JSON.parse(data)};
          response.push(processed);
          callback(null, processed);
        })
        .catch(err => {
          console.error('Error getting crime data:', err);
          const processed = {crime: 'error'};
          response.push(processed);
          callback(null, processed);
        })
      }
    ], (err, data) => {
      console.error('Error:', err, '\nData:', data);
      if (err) {
        console.error('Error getting data:', err);
        // response.push(err);
        // res.status(400).send(err);
      } else {
        try {
          console.log('Gateway successfully read from the microservices, current response:', data);
          res.status(200).send(data);
        } catch(e) {
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
