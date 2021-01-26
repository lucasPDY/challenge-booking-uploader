import React, { Component } from "react";
import Dropzone from "react-dropzone";

import Papa from "papaparse";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";

import "./App.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const apiUrl = "http://localhost:3004";
const localizer = momentLocalizer(moment);
const startingDate = new Date("2018/03/04");

class App extends Component {
  state = { bookings: [] };

  componentWillMount() {
    fetch(`${apiUrl}/bookings`)
      .then((response) => response.json())
      .then((bookings) => {
        console.log("Bookings here \n", bookings);
        // this.getUsers(bookings);
        this.setBookings(bookings, false);
      });
  }

  parseBookings = (bookings) => {
    return bookings.map((bookingRecord) => ({
      time: Date.parse(bookingRecord.time),
      duration: bookingRecord.duration * 60 * 1000, // mins into ms
      userId: bookingRecord.userId,
    }));
  };

  setBookings = (bookings, isNew) => {
    let id = 1;
    const newBookings = bookings.map((booking) => {
      const startDate = new Date(booking.time);
      const endDate = new Date(booking.time + booking.duration);

      // Find overlap find Dates, taken from https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap/325964
      // (StartA <= EndB) and (EndA >= StartB)
      const hasOverlap = this.state.bookings.some((booking) => {
        return booking.start < endDate && booking.end > startDate;
      });

      return {
        title: `User${booking.userId}`,
        start: startDate,
        end: endDate,
        id: id++,
        overlap: hasOverlap,
        new: isNew,
      };
    });
    this.setState(
      { bookings: [...this.state.bookings, ...newBookings] },
      () => "Bookings updated"
    );
  };

  onComplete = ({ data, errors, meta }) => {
    if (errors.length > 0) {
      alert("Error parsing CSV. Please check and try again later.");
      return;
    }
    console.log(meta);
    console.log(data);
    const bookings = this.parseBookings(data);
    console.log(bookings);
    this.setBookings(bookings, true);
  };

  onDrop = (files) => {
    console.log(files);
    Papa.parse(files[0], {
      complete: this.onComplete,
      header: true,
      delimiter: ", ",
      skipEmptyLines: true,
    });
  };

  customEventPropGetter = (event) => {
    if (event.new && event.overlap) return { className: "rbc-event-overlap" };
    else if (event.new) return { className: "rbc-event-new" };
    else return {};
  };

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <Dropzone accept=".csv" onDrop={this.onDrop}>
            Drag files here. 
          </Dropzone>
        </div>
        <div className="App-main">
          <p>Uploaded bookings will be shown in the calendar. Invalid bookings will be shown in red.</p>
          <p><b>Existing bookings:</b></p>
          <Calendar
            localizer={localizer}
            events={this.state.bookings}
            defaultView={Views.WEEK}
            defaultDate={startingDate}
            eventPropGetter={this.customEventPropGetter}
          />
          <button onClick={this.onSave}>Upload Bookings</button>
        </div>
      </div>
    );
  }
}

export default App;
