const { connect: connectMongo } = require('./mongo');
const startPoller = require('./poller');

const start = async () => {
    await connectMongo();
    startPoller();
}

start();