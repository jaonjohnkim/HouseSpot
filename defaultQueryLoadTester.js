const request = require('request-promise');
// console.log('process.env:', process.env);
const statsD = require('node-statsd');
const statsDClient = new statsD({
  host: 'statsd.hostedgraphite.com',
  port: 8125,
  prefix: process.env.HOSTEDGRAPHITE_APIKEY
});

const stringifyDate = (date) => {
  let month = date.getMonth() + 1;
  let dateNum = date.getDate();
  month = month.toString().length === 1 ? "0" + month : month;
  dateNum = dateNum.toString().length === 1 ? "0" + dateNum : dateNum;
  return `${date.getFullYear()}-${month}-${dateNum}T00:00:00.000`;
}

let QPS = process.env.QPS;
let QPSlimit = 200;
const loadTest = () => {
  const zipcodes = [
    94102,94103,94104,94105,94107,94108,94109,94110,94111,94112,94114,94115,94116,
    94117,94118,94121,94122,94123,94124,94127,94129,94130,94131,94132,94133,94134,94158
  ];
  const granularity = ['day', 'week', 'month'];
  let zipcode = zipcodes[Math.round(Math.random() * (zipcodes.length - 1))];
  let gran = granularity[1];
  let threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  let startDate = stringifyDate(threeMonthsAgo);
  let endDate = stringifyDate(new Date());
  statsDClient.increment('.loadTester.query.all');
  const start = Date.now();
  // request.get(`https://housespot.herokuapp.com/json?zipcode=${zipcode}&startDate=${startDate}&endDate=${endDate}&granularity=${gran}`)
  request.get(`http://13.57.98.222:3000/json?zipcode=${zipcode}&startDate=${startDate}&endDate=${endDate}&granularity=${gran}`)
  .then(data => {
    data = JSON.parse(data);
    statsDClient.increment('.loadTester.query.success');
    statsDClient.timing('.loadTester.query.success.latency_ms', Date.now() - start);

    data.fire === "error" || data.fire === undefined ?
      statsDClient.increment('.loadTester.query.fire.fail') :
      statsDClient.increment('.loadTester.query.fire.success');
    data.crime === "error" || data.crime === undefined ?
      statsDClient.increment('.loadTester.query.crime.fail') :
      statsDClient.increment('.loadTester.query.crime.success');
    data.house === "error" || data.house === undefined ?
      statsDClient.increment('.loadTester.query.house.fail') :
      statsDClient.increment('.loadTester.query.house.success');
    data.health === "error" || data.health === undefined ?
      statsDClient.increment('.loadTester.query.health.fail') :
      statsDClient.increment('.loadTester.query.health.success');
  })
  .catch(error => {
    console.error(error);
    statsDClient.increment('.loadTester.query.fail');
    statsDClient.timing('.loadTester.query.fail.latency_ms', Date.now() - start);
  })
  // console.log('Pinged for zipcode:', zipcode);
  console.log('Current QPS:', QPS);
  // console.log('Next timer:', testEnd);
}

let prevTest = null;
setInterval(() => {
  if (prevTest) clearInterval(prevTest);
  if (QPS <= QPSlimit) {
    console.log('Current QPS:', QPS);
    prevTest = setInterval(loadTest, Math.round(1000 / QPS));
  }
  QPS++;
}, 1000 * 60)
