const axios = require('axios');
const Account = require('../mongo/schemas/Account');
const Networth = require('../mongo/schemas/Networth');
const notifier = require('../notifier');
const { POLL_TIME } = require('dotenv').config().parsed

const API_KEY = '96e0cc51-a62e-42ca-acee-910ea7d2a241';
const ENDPOINT = `https://api.zapper.fi/v1/balances?api_key=${API_KEY}`

const init = () => {
    console.log("Beginning polling time for seconds:", POLL_TIME)
    setInterval(poll, POLL_TIME * 1000);
}

const poll = async () => {
    console.log("Polling:", Date.now());

    const addresses = (await Account.find()).map(account => account.address);

    const url = ENDPOINT + addresses.map(address => `&addresses[]=${address}`).join("");

    const { data } = await axios.get(url);
   
    const rawNetworks = data.split("\n").filter(item => item.length);

    const networks = rawNetworks.map(raw => JSON.parse(raw));
    const addressBalances = addresses.reduce((accum, next) => {
        return { [next]: 0, ...accum };
    }, {});

    networks.filter(network => !!network.balances).forEach(network => {
        const { balances } = network;

        const addresses = Object.keys(balances);
        addresses.forEach(address => {
            balances[address].products.forEach(product => {
                const total = product.assets.reduce((accum, asset) => accum + asset.balanceUSD, 0);
                addressBalances[address] += total;
            });
        });
    });

    Object.entries(addressBalances).forEach(([address, total]) => {
        console.log(`Updating address ${address} to balance ${total}`);

        new Networth({
            address,
            total
        }).save().then(() => {
            console.log(`Saved address ${address} successfully`);
            notifier(address);
        });
    });
};

module.exports = init;