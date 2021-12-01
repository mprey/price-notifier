const Account = require('../mongo/schemas/Account');
const Networth = require('../mongo/schemas/Networth');
const nodemailer = require('nodemailer');
const config = require('dotenv').config().parsed;

const notifier = async (address) => {
    console.log(`Beginning notifier for address: ${address}`);

    const account = await Account.findOne({ address });

    if (!account.notify) {
        console.log(`Not notifying address: ${address}`);
        return;
    }

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.EMAIL_USER,
            pass: config.EMAIL_PASSWORD
        }
    });

    const [now, previous] = (await Networth.find({ address }).sort({ timestamp: -1 }).limit(2).exec()).map(entry => entry.total);
    
    const message = {
        from: "crypto-magic-guru@prey.com",
        to: account.phoneNumber,
        subject: "Price Update",
        text: generateMessage(now, previous),
    }

    transport.sendMail(message, (err) => {
        if (err) {
            console.log("Error sending email:", err);
        } else {
            console.log(`Sent email to address ${address} successfully`);
        }
    });
}

const generateMessage = (now, previous) => {
    const percentDifference = Number(((now - previous) / previous) * 100).toFixed(2);

    return `Your current networth is $${now.toFixed(2)}. Your networth has ${now > previous ? 'increased' : 'decreased'} since the last notification by ${percentDifference}%. (${(now - previous).toFixed(2)})`;
}

module.exports = notifier;