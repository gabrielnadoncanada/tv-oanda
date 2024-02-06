const axios = require('axios');
const process = require('process');
require('dotenv').config();
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {statusCode: 405, body: 'Method Not Allowed'};
    }

    console.log(process.env)
    console.log('Received event:', event); // Log the entire event

    const {type, pair, amount, price} = JSON.parse(event.body);
    console.log('Parsed body:', {type, pair, amount, price}); // Log the parsed body

    const url = `https://api-fxpractice.oanda.com/v3/accounts/${process.env.OANDA_ACCOUNT_ID}/orders`;
    const data = {
        order: {
            units: type === "buy" ? amount : `-${amount}`, // Positive for buy, negative for sell
            instrument: pair.replace("USD", "_USD"), // Adjusting the pair format
            timeInForce: 'FOK',
            type: price === "market" ? 'MARKET' : 'LIMIT', // Assuming 'market' for market orders
            positionFill: 'DEFAULT'
        }
    };
    console.log('Sending data:', data); // Log the data being sent

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OANDA_API_KEY}`
        }
    };

    try {
        const response = await axios.post(url, data, config);
        console.log('Received response:', response.data); // Log the received response
        return {
            statusCode: 200,
            body: JSON.stringify(response.data)
        };
    } catch (error) {
        console.error("Error executing trade:", error.message);
        return {
            statusCode: error.response ? error.response.status : 500,
            body: JSON.stringify({message: error.message})
        };
    }
};