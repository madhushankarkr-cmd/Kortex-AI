require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "TEST_KEY");

app.post('/api/agent', async (req, res) => {
    const { userPrompt } = req.body;
    
    try {
        console.log("User asked:", userPrompt);
        
        let intent = "CHECK_ATTENDANCE"; // Default
        if (userPrompt.toLowerCase().includes("leave")) intent = "APPLY_LEAVE";
        if (userPrompt.toLowerCase().includes("grade")) intent = "CHECK_GRADES";

        const command = { intent: intent, parameters: {} };

        
        await new Promise(r => setTimeout(r, 1500));

        
        const scraperResult = {
            subject: "Mathematics",
            percentage: "85%",
            status: "Safe",
            last_updated: new Date().toLocaleTimeString()
        };

        res.json({ ai_command: command, data: scraperResult });

    } catch (error) {
        console.error("Agent Error:", error);
        res.status(500).json({ error: "Agent Failure" });
    }
});

app.listen(3000, () => console.log('✅ KORTEX Brain running on port 3000'));