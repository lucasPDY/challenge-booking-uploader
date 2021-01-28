const apiUrl = "http://localhost:3004";

const BookingService = {
  async getBookings() {
    return await fetch(`${apiUrl}/bookings`).then((response) =>
      response.json()
    );
  },
  async uploadBookings(bookingsPayload) {
    // Simple POST request with a JSON body using fetch, taken from https://jasonwatmore.com/post/2020/02/01/react-fetch-http-post-request-examples
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingsPayload),
    };
    return await fetch(`${apiUrl}/bookings`, requestOptions)
      .then((response) => response.json())
  },
};

export default BookingService;
