const parseBookings = (bookings) => {
  return bookings.map((bookingRecord) => ({
    time: Date.parse(bookingRecord.time),
    duration: bookingRecord.duration * 60 * 1000, // mins into ms
    user_id: bookingRecord.user_id,
  }));
};

module.exports = { parseBookings };
