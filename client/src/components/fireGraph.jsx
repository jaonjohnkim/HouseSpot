import React, { Component } from 'react';
import LineChart from 'react-linechart';

class FireGraph extends Component {
  constructor() {
    super();
    console.log(LineChart);
  }

  render() {
    return (
      <div>'Fire Graph Here'
        <LineChart
          // xType={'time'}
          // axes
          // verticalGrid
          // margin={{top: 10, right: 10, bottom: 50, left: 50}}
          // axisLabels={{x: 'Date', y: 'Fire Incidents'}}
          xLabel={"Dates"}
          yLabel={"Latency"}
          interpolate={"linear"}
          width={500}
          height={250}
          data={[
            {
              color: "steelblue",
              points: [{x: 1, y: 2}, {x: 3, y: 5}, {x: 7, y: -3}]
            }
          ]}
        />
      </div>
    );
  }
}


export default FireGraph;
