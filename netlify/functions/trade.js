const axios = require('axios');
const process = require('process');
require('dotenv').config();

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {statusCode: 405, body: 'Method Not Allowed'};
    }

    const {action} = JSON.parse(event.body);

    const url = `https://api-fxpractice.oanda.com/v3/accounts/101-002-28212823-002/orders`;
    const tradesUrl = `https://api-fxpractice.oanda.com/v3/accounts/101-002-28212823-002/openTrades`;
    const tradesCloseUrl = `https://api-fxpractice.oanda.com/v3/accounts/101-002-28212823-002/trades`;

    let units = 10000; // Default units

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer 0d01c916055937f23b957993ef026058-8a32de7d82fb9a7f0711a656497611d6`
        }
    };

    // Fetch open trades
    const responseTrades = await axios.get(tradesUrl, config);

    // If there are open trades
    if(responseTrades.data.trades.length > 0) {
        const lastTrade = responseTrades.data.trades[responseTrades.data.trades.length - 1];

        // If the last trade action is the same as the current action
        if(lastTrade.currentUnits > 0 && action === "buy" || lastTrade.currentUnits < 0 && action === "sell") {
            units *= 2; // Double the units
        } else {
            // Close the last trade
            await axios.put(`${tradesCloseUrl}/${lastTrade.id}/close`, {}, config);
        }
    }

    const data = {
        order: {
            units: action === "buy" ? units : `-` + units,
            instrument: "USD_CAD",
            timeInForce: 'FOK',
            type: 'MARKET',
            positionFill: 'DEFAULT'
        }
    };

    try {
        const response = await axios.post(url, data, config);
        return {
            statusCode: 200,
            body: JSON.stringify(response.data)
        };
    } catch (error) {
        return {
            statusCode: error.response ? error.response.status : 500,
            body: JSON.stringify({message: error.message})
        };
    }
};