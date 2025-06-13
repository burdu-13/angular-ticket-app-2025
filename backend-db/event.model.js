const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  imgUrl: { type: String, required: true },
  ticketTiers: [
    {
      name: { type: String, required: true },
      ticketsAvailable: { type: Number, required: true },
      price: { type: Number, required: true },
      ticketsSold: { type: Number, default: 0 }
    },
  ],
  companyName: { type: String, required: true },
  isSalesSuspended: { type: Boolean, default: false },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
