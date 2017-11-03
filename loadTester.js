const request = require('request-promise');
console.log('process.env:', process.env);
const statsD = require('node-statsd');
const statsDClient = new statsD({
  host: 'statsd.hostedgraphite.com',
  port: 8125,
  prefix: process.env.HOSTEDGRAPHITE_APIKEY
});


setInterval(() => {
  const zipcodes = [
    94102,
    94103,
    94104,
    94105,
    94107,
    94108,
    94109,
    94110,
    94111,
    94112,
    94114,
    94115,
    94116,
    94117,
    94118,
    94121,
    94122,
    94123,
    94124,
    94127,
    94129,
    94130,
    94131,
    94132,
    94133,
    94134,
    94158
  ];
  const granularity = ['day', 'week', 'month'];

  let zipcode = zipcodes[Math.round(Math.random() * (zipcodes.length - 1))];
  let gran = granularity[Math.round(Math.random() * (granularity.length - 1))];
  // zipcode = 94111;


  const start = Date.now();
  request(`https://housespot.herokuapp.com/json?zipcode=${zipcode}&startDate=2017-07-01T00:00:00.000&endDate=2017-10-25T00:00:00.000&granularity=${gran}`)
  .then(data => {
    statsDClient.increment('.loadTester.query.success');
    statsDClient.timing('.loadTester.query.success.latency_ms', Date.now() - start);
    data.forEach(obj => {
      if (obj.fire) {
        if (obj.fire === "error") statsDClient.increment('.loadTester.query.fire.fail');
        else statsDClient.increment('.loadTester.query.fire.success');
      } else if (obj.crime) {
        if (obj.crime === "error") statsDClient.increment('.loadTester.query.crime.fail');
        else statsDClient.increment('.loadTester.query.crime.success');
      } else if (obj.house) {
        if (obj.house === "error") statsDClient.increment('.loadTester.query.house.fail');
        else statsDClient.increment('.loadTester.query.house.success');
      } else if (obj.health) {
        if (obj.health === "error") statsDClient.increment('.loadTester.query.health.fail');
        else statsDClient.increment('.loadTester.query.health.success');
      }
    })
  })
  .catch(error => {
    statsDClient.increment('.loadTester.query.fail');
    statsDClient.timing('.loadTester.query.fail.latency_ms', Date.now() - start);
  })
  console.log('Pinged for zipcode:', zipcode);
}, (1000 / process.env.QPS) || 100);

qps * something = ms;
something = 1000 / q
