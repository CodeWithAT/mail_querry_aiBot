// 🔴 THE ULTIMATE IPV6 OVERRIDE
require('dns').setDefaultResultOrder('ipv4first');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ==========================================
// 1. Setup CORS (NUCLEAR OPTION: ALLOW ALL)
// ==========================================
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"]
}));

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());

// ==========================================
// 2. Initialize Gemini AI
// ==========================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Updated model names (v1beta compatible, 2026)
const MODEL_PRIORITY = [
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash-latest"
];

// ==========================================
// Helper: Generate AI response with fallback
// ==========================================
async function generateWithFallback(prompt) {
    let lastError = null;

    for (const modelName of MODEL_PRIORITY) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                console.log(`🤖 Trying model: ${modelName} (Attempt ${attempt})`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                console.log(`✅ AI Synthesis Complete using: ${modelName}`);
                return { text, modelUsed: modelName };
            } catch (err) {
                lastError = err;

                // ❌ API key issue — no point retrying any model
                if (err.message.includes('403') || err.message.includes('leaked') || err.message.includes('API key')) {
                    console.error('🔑 API Key Error — Please update GEMINI_API_KEY in Render env!');
                    throw new Error('Invalid or leaked API key. Update GEMINI_API_KEY in environment variables.');
                }

                const isRetryable =
                    err.message.includes('503') ||
                    err.message.includes('Service Unavailable') ||
                    err.message.includes('high demand') ||
                    err.message.includes('overloaded') ||
                    err.message.includes('429') ||
                    err.message.includes('RESOURCE_EXHAUSTED');

                console.warn(`⚠️ ${modelName} Attempt ${attempt} failed: ${err.message}`);

                if (isRetryable && attempt < 2) {
                    const waitMs = 3000 * attempt;
                    console.log(`⏳ Waiting ${waitMs / 1000}s before retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitMs));
                } else {
                    console.log(`➡️ Moving to next model...`);
                    break;
                }
            }
        }
    }

    throw new Error(`All AI models failed. Last error: ${lastError?.message || 'Unknown'}`);
}

// ==========================================
// Watch for the Atma Visualizer connection
// ==========================================
io.on('connection', (socket) => {
    console.log('👁️ Core Atma Visualizer Connected:', socket.id);
});

// ==========================================
// 3. The Main Processing Route
// ==========================================
app.post('/api/process', async (req, res) => {
    const { prompt, email } = req.body;

    if (!prompt || !email) {
        return res.status(400).json({ error: 'Prompt and email required' });
    }

    try {
        console.log(`\n🚀 New Request Initiated for: ${email}`);

        // --- SAFETY CHECK ---
        if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID) {
            console.error("⚠️ WARNING: EmailJS variables are missing! Check your Render Environment tab.");
        }

        // --- NODE 1: AI SYNTHESIS (with fallback chain) ---
        io.emit('atma_status', 'ai_processing');

        const { text: aiResponse, modelUsed } = await generateWithFallback(prompt);
        console.log(`📌 Model used for this request: ${modelUsed}`);

        // --- CONNECTOR 1: TRANSFERRING ---
        io.emit('atma_status', 'ai_transfer');
        await new Promise(resolve => setTimeout(resolve, 1500));

        // --- NODE 2: EMAILJS RELAY ---
        io.emit('atma_status', 'email_processing');

        const emailData = {
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: process.env.EMAILJS_TEMPLATE_ID,
            user_id: process.env.EMAILJS_PUBLIC_KEY,
            accessToken: process.env.EMAILJS_PRIVATE_KEY,
            template_params: {
                to_email: email,
                prompt: prompt.substring(0, 30) + '...',
                ai_response: aiResponse
            }
        };

        const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });

        if (!emailResponse.ok) {
            const errText = await emailResponse.text();
            throw new Error(`EmailJS API Error: ${errText}`);
        }

        console.log('✅ Email Successfully Relayed via API');

        // --- CONNECTOR 2: TRANSFERRING ---
        io.emit('atma_status', 'email_transfer');
        await new Promise(resolve => setTimeout(resolve, 1500));

        // --- NODE 3: SUCCESS ---
        io.emit('atma_status', 'success');
        setTimeout(() => io.emit('atma_status', 'idle'), 5000);

        res.status(200).json({ message: 'Process Complete' });

    } catch (error) {
        console.error('❌ Pipeline Error:', error.message);
        io.emit('atma_status', 'idle');
        res.status(500).json({ error: error.message || 'System Failure' });
    }
});

// ==========================================
// 4. Health Check
// ==========================================
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`\n🟢 Server Online running on port ${PORT}`);
});
