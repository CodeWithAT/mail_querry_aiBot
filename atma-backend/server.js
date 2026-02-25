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

// 1. Setup CORS
const allowedOrigins = [
    "https://mail-querry-ai-bot-iits.vercel.app",
    "http://localhost:5173"
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
}));

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

app.use(express.json());

// 2. Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Watch for the Atma Visualizer connection
io.on('connection', (socket) => {
    console.log('👁️ Core Atma Visualizer Connected:', socket.id);
});

// 3. The Main Processing Route
app.post('/api/process', async (req, res) => {
    const { prompt, email } = req.body;

    if (!prompt || !email) {
        return res.status(400).json({ error: 'Prompt and email required' });
    }

    try {
        console.log(`\n🚀 New Request Initiated for: ${email}`);

        // --- SAFETY CHECK: Warns you if Render keys are missing ---
        if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID) {
            console.error("⚠️ WARNING: EmailJS variables are missing! Check your Render Environment tab.");
        }

        // --- NODE 1: AI SYNTHESIS ---
        io.emit('atma_status', 'ai_processing');
        
        // Keeping model as gemini-2.5-flash as per your request
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();
        console.log('✅ AI Synthesis Complete');

        // --- CONNECTOR 1: TRANSFERRING ---
        io.emit('atma_status', 'ai_transfer');
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        // --- NODE 2: EMAILJS RELAY (FIREWALL BYPASS) ---
        io.emit('atma_status', 'email_processing');
        
        const emailData = {
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: process.env.EMAILJS_TEMPLATE_ID,
            user_id: process.env.EMAILJS_PUBLIC_KEY,
            accessToken: process.env.EMAILJS_PRIVATE_KEY,
            template_params: {
                to_email: email,
                prompt: prompt.substring(0, 30) + '...',
                ai_response: aiResponse // This maps to the {{{ai_response}}} in your template
            }
        };

        // Sending via API fetch to bypass the SMTP block
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

        // --- NODE 3: SUCCESS TRANSMISSION ---
        io.emit('atma_status', 'success');
        setTimeout(() => io.emit('atma_status', 'idle'), 5000);

        res.status(200).json({ message: 'Process Complete' });

    } catch (error) {
        console.error('❌ Pipeline Error:', error.message);
        io.emit('atma_status', 'idle');
        res.status(500).json({ error: 'System Failure' });
    }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`\n🟢 Server Online running on port ${PORT}`);
});
