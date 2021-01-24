import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import './App.css';
import Papa from 'papaparse';

const apiUrl = 'http://localhost:3001'

class App extends Component {

  state = {}

  componentWillMount() {
    fetch(`${apiUrl}/bookings`)
      .then((response) => response.json())
      .then((bookings) => {
        this.setState({ bookings })
      })
  }

  onDrop(files) {
    console.log(files);
    Papa.parse(files[0], {
      complete: (result) => {
        console.log(result)
      },
      header: true,
      delimiter: ", ",
    });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <Dropzone
            accept=".csv"
            onDrop={this.onDrop}
          >
            Drag files here
          </Dropzone>
        </div>
        <div className="App-main">
          <p>Existing bookings:</p>
          {
            (this.state.bookings || []).map((booking, i) => {
              const date = new Date(booking.time);
              const duration = booking.duration / (60 * 1000);
              return (
                <p key={i} className="App-booking">
                  <span className="App-booking-time">{date.toString()}</span>
                  <span className="App-booking-duration">{duration.toFixed(1)}</span>
                  <span className="App-booking-user">{booking.userId}</span>
                </p>
              )
            })
          }
        </div>
      </div>
    );
  }
}

export default App;
