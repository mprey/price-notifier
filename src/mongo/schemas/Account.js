const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Account = new Schema({
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    notify: { type: Boolean, required: true, default: true },
});

module.exports = mongoose.model('Account', Account);