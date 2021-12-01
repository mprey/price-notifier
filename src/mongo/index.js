const mongoose = require('mongoose');
const config = require('dotenv').config().parsed

module.exports = {
    async connect() {
        await mongoose.connect(config.MONGO_URI);
        console.log("Connected to MongoDB");
    },
};
