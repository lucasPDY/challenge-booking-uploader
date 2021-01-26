import React, { Component } from "react";
import Dropzone from "react-dropzone";

import Papa from "papaparse";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";

import "./App.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { parseBookings } from "./util";

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
        this.addBookings(bookings, false);
      });
  }

  addBookings = (bookings, isNew) => {
    const newBookings = bookings.map((booking) => {
      const startDate = new Date(booking.time);
      const endDate = new Date(booking.time + booking.duration);

      // Find overlap find Dates, taken from https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap/325964
      // (StartA <= EndB) and (EndA >= StartB)
      const hasOverlap = this.state.bookings.some((booking) => {
        return booking.start < endDate && booking.end > startDate;
      });

      return {
        title: `User${booking.user_id}`,
        start: startDate,
        end: endDate,
        overlap: hasOverlap,
        new: isNew,
        duration: booking.duration,
        user_id: booking.user_id,
      };
    });
    this.setState(
      { bookings: [...this.state.bookings, ...newBookings] },
      () => "Bookings updated"
    );
  };

  // Function that runs once Papaparse is finished parsing the CSV
  onComplete = ({ data, errors, meta }) => {
    if (errors.length > 0) {
      alert("Error parsing CSV. Please check and try again later.");
      return;
	}
	// TODO: Verify if bookings added have correct headers before adding to state
    console.log(meta);
    console.log(data);
    const bookings = parseBookings(data);
	console.log(bookings);
    this.addBookings(bookings, true);
  };

  // Assumes uploaded CSV File does not contain any overlapping timeslots
  onDrop = (files) => {
    console.log(files);
    Papa.parse(files[0], {
      complete: this.onComplete,
      header: true,
      delimiter: ", ",
      skipEmptyLines: true,
    });
  };

  onBookingUpdate = () => {
    // Payload should include bookings that do not overlap
    const bookingsPayload = this.state.bookings
      .filter((booking) => {
        return !booking.overlap && booking.new;
      })
      .map((booking) => {
        return {
          duration: booking.duration / 60 / 1000, // Convert back to minutes
          user_id: booking.user_id,
          time: booking.start.toString(),
        };
      });


    // Simple POST request with a JSON body using fetch, taken from https://jasonwatmore.com/post/2020/02/01/react-fetch-http-post-request-examples
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingsPayload),
    };
    fetch(`${apiUrl}/bookings`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
		// Reset bookings to default state before refreshing bookings from server
        this.setState({ bookings: [] });
        this.addBookings(data, false);
      })
      .catch((error) => {
        alert(`Error processing bookings. Try again later.\n${error}`);
      });
  };

  // Function that takes an event and returns a classname or style that will be applied to the event
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
          <p>
            Uploaded bookings will be shown in the calendar. Any new bookings
            that overlap with old bookings will be shown in red, and will not be
            saved.
          </p>
          <p>
            <b>Existing bookings:</b>
          </p>
          <Calendar
            localizer={localizer}
            events={this.state.bookings}
            defaultView={Views.WEEK}
            defaultDate={startingDate}
            eventPropGetter={this.customEventPropGetter}
          />
          <button className="booking-button" onClick={this.onBookingUpdate}>
            UPDATE
          </button>
        </div>
      </div>
    );
  }
}

export default App;
