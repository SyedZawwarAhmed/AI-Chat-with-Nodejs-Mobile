import express from 'express';
import { Agent, TLLMEvent } from '@smythos/sdk';
import cors from 'cors';

const app = express();
const PORT = +process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Agent
const agent = new Agent({
    id: 'crypto-market-assistant',

    name: 'CryptoMarket Assistant',
    behavior: 'You are a crypto price tracker. You are given a coin id and you need to get the price of the coin in USD',
    model: 'gpt-4o',
});

agent.addSkill({
    name: 'MarketData',
    description: 'Use this skill to get comprehensive market data and statistics for a cryptocurrency',
    process: async ({ coin_id }) => {
        const url = `https://api.coingecko.com/api/v3/coins/${coin_id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
        const response = await fetch(url);
        const data = await response.json();
        return data.market_data;
    },
});

// SSE STREAMING ENDPOINT
app.post('/message/stream', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
        const stream = await agent.prompt(message).stream();

        stream.on(TLLMEvent.Content, (chunk) => {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        });

        stream.on(TLLMEvent.ToolCall, (toolCall) => {
            res.write(`data: ${JSON.stringify({ toolCall })}\n\n`);
        });

        stream.on(TLLMEvent.End, () => {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
        });

        stream.on('error', (err) => {
            res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
            res.end();
        });
    } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
