import express from 'express';
import { Agent, Model, TLLMEvent } from '@SmythOS/sdk';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const app = express();
const PORT = +process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log('__dirname', __dirname);

const agentsDataDir = path.resolve(__dirname, '../agents-data');
if (!fs.existsSync(agentsDataDir)) {
    fs.mkdirSync(agentsDataDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, agentsDataDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

let agentPath = path.resolve(agentsDataDir, 'crypto-info-agent.smyth');
let agent: Agent | null = null;

// Initialize agent if file exists
if (fs.existsSync(agentPath)) {
    try {
        agent = Agent.import(agentPath, {
            model: Model.OpenAI('gpt-4o', { temperature: 1.0 }),
        });
        console.log('Agent initialized from:', agentPath);
    } catch (error) {
        console.error('Failed to initialize agent:', error);
    }
}

// Upload endpoint
app.post('/upload-agent', upload.single('agentFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const newAgentPath = req.file.path;
        console.log('New agent uploaded to:', newAgentPath);

        // Re-initialize agent
        agent = Agent.import(newAgentPath, {
            model: Model.OpenAI('gpt-4o', { temperature: 1.0 }),
        });

        agentPath = newAgentPath; // Update current path

        res.json({ success: true, message: 'Agent uploaded and initialized successfully' });
    } catch (error) {
        console.error('Error initializing agent:', error);
        res.status(500).json({ error: 'Failed to initialize agent from uploaded file' });
    }
});

// SSE STREAMING ENDPOINT
app.post('/message/stream', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (!agent) {
        return res.status(503).json({ error: 'Agent not initialized. Please upload a .smyth file first.' });
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
