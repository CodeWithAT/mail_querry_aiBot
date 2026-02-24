const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const server = http.createServer(app);

// 1. Setup CORS to allow your live Vercel frontend and local testing
// Replace the Vercel URL with your actual deployment link if it changes
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

// 2. Initialize Gemini AI securely using Environment Variables
// Ensure GEMINI_API_KEY is added to your Render Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 3. Initialize Nodemailer (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Watch for the Atma Visualizer connection
io.on('connection', (socket) => {
    console.log('👁️ Core Atma Visualizer Connected:', socket.id);
});

// 4. The Main Processing Route
app.post('/api/process', async (req, res) => {
    const { prompt, email } = req.body;

    if (!prompt || !email) {
        return res.status(400).json({ error: 'Prompt and email required' });
    }

    try {
        console.log(`\n🚀 New Request Initiated for: ${email}`);

        // --- NODE 1: AI SYNTHESIS ---
        io.emit('atma_status', 'ai_processing');
        // Correcting model to "gemini-1.5-flash" (2.5-flash is not a standard model ID)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();
        console.log('✅ AI Synthesis Complete');

        // --- CONNECTOR 1: TRANSFERRING ---
        io.emit('atma_status', 'ai_transfer');
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        // --- NODE 2: SMTP RELAY ---
        io.emit('atma_status', 'email_processing');
        const mailOptions = {
            from: `"Neural Query Engine" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Neural Result: ${prompt.substring(0, 30)}...`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; background-color: #f4f4f9; border-radius: 10px;">
                    <h2 style="color: #6b21a8;">Neural Query Engine</h2>
                    <p><strong>Your Prompt:</strong> ${prompt}</p>
                    <hr style="border: 1px solid #ddd;" />
                    <div style="font-size: 16px; line-height: 1.6; color: #333;">
                        ${aiResponse.replace(/\n/g, '<br>')}
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log('✅ Email Successfully Relayed');

        // --- CONNECTOR 2: TRANSFERRING ---
        io.emit('atma_status', 'email_transfer');
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        // --- NODE 3: SUCCESS TRANSMISSION ---
        io.emit('atma_status', 'success');

        // Reset visualizer after 5 seconds
        setTimeout(() => io.emit('atma_status', 'idle'), 5000);

        // Send success back to the Home page
        res.status(200).json({ message: 'Process Complete' });

    } catch (error) {
        console.error('❌ Pipeline Error:', error);
        io.emit('atma_status', 'idle');
        res.status(500).json({ error: 'System Failure' });
    }
});

// Use Render's dynamic PORT or default to 5001
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`\n🟢 Server Online running on port ${PORT}`);
    console.log(`Waiting for Neural Engine inputs...`);
});