const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Networth = new Schema({
    address: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now() },
    total: { type: Number, required: true },
});

module.exports = mongoose.model('Networth', Networth);