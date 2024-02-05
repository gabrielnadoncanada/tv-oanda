// functions/oanda.js
const axios = require('axios');
require('dotenv').config();

exports.handler = async function(event, context) {
    const { TRADINGVIEW_STRATEGY } = event.queryStringParameters;

    const OANDA_API_KEY = process.env.OANDA_API_KEY;
    const OANDA_ACCOUNT_ID = process.env.OANDA_ACCOUNT_ID;

    const url = `https://api-fxtrade.oanda.com/v3/accounts/${OANDA_ACCOUNT_ID}/orders`;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OANDA_API_KEY}`
    };

    const data = {
        order: {
            units: '100',
            instrument: TRADINGVIEW_STRATEGY,
            timeInForce: 'FOK',
            type: 'MARKET',
            positionFill: 'DEFAULT'
        }
    };

    try {
        const response = await axios.post(url, data, { headers });
        return {
            statusCode: 200,
            body: JSON.stringify(response.data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to execute order' })
        };
    }
};