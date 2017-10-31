import React, {Component} from 'react';
import Prediction from './components/prediction.jsx';
import HouseGraph from './components/houseGraph.jsx';
import CrimeGraph from './components/crimeGraph.jsx';
import FireGraph from './components/fireGraph.jsx';
import HealthGraph from './components/healthGraph.jsx';
import $ from 'jquery';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      crimeData: null,
      fireData: [
        [
          {x: 1, y: 20},
          {x: 5, y: 25},
          {x: 10, y: 30}
        ]
      ],
      healthData: null,
      houseData: null,
      prediction: null
    };
  }

  componentWillMount() {
    fetch('/', {qs: {zipcode: , }})
    .then(response => {

    })
  }

  getDataFromServices() {
    fetch('/', {qs: {zipcode: , }})
    .then(response => {

    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">HouseSpot - House Value Property Predictor</h1>
        </header>
        <p className="App-intro">
          Please enter a zipcode: <input id='zipcode' type='text'></input>
        </p>
        <Prediction />
        <HouseGraph />
        <CrimeGraph />
        <FireGraph data={this.state.fireData}/>
        <HealthGraph />
      </div>
    );
  }
}

export default App;
