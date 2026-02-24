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

// 🌐 UPDATED CORS: Replace the Vercel URL with your actual live link
app.use(cors({
  origin: ["https://your-project-name.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST"],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: ["https://your-project-name.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

// Initialize AI with the environment variable you just set on Render
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

app.post('/api/process', async (req, res) => {
  const { prompt, email } = req.body;
  try {
    io.emit('atma_status', 'ai_processing');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    io.emit('atma_status', 'ai_transfer');
    await new Promise(r => setTimeout(r, 1500));

    io.emit('atma_status', 'email_processing');
    await transporter.sendMail({
      from: `"Neural Core" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "AI Response",
      text: aiResponse
    });

    io.emit('atma_status', 'email_transfer');
    await new Promise(r => setTimeout(r, 1500));

    io.emit('atma_status', 'success');
    setTimeout(() => io.emit('atma_status', 'idle'), 5000);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    io.emit('atma_status', 'idle');
    res.status(500).json({ error: "Pipeline failed" });
  }
});

// ⚡ Render uses process.env.PORT
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🟢 Neural Core Live on Port ${PORT}`));