// 1. Import package yang dibutuhkan
const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

// 2. Konfigurasi awal
dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

// 3. Middleware
app.use(cors());
app.use(express.json());

// 4. Inisialisasi Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Konfigurasi model
const modelConfig = {
    model: "gemini-2.0-flash-exp",
    generationConfig: {
        temperature: 0.7,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 500,
        candidateCount: 1,
    },
    safetySettings: [
        {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
    ],
};

// Endpoint untuk test koneksi
app.get('/', (req, res) => {
    res.send('Hello from the backend! Kaell model is ready.');
});

// 5. Endpoint API untuk Chat dengan History Support
app.post('/chat', async (req, res) => {
    try {
        const { prompt, history } = req.body; // Tambah history parameter
        
        // Validasi Input
        if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
            return res.status(400).send({ 
                error: "Input 'prompt' is required and must be a non-empty string." 
            });
        }

        console.log('Received prompt:', prompt);
        console.log('Chat history length:', history ? history.length : 0);

        const model = genAI.getGenerativeModel(modelConfig);
        
        // Jika ada history, gunakan chat session
        if (history && history.length > 0) {
            // Format history untuk Gemini API
            const formattedHistory = history.map(msg => ({
                role: msg.isUser ? "user" : "model",
                parts: [{ text: msg.text }]
            }));

            console.log('Formatted history:', JSON.stringify(formattedHistory, null, 2));

            // Start chat session dengan history
            const chat = model.startChat({
                history: formattedHistory,
                generationConfig: modelConfig.generationConfig,
            });

            // Send message dengan konteks history
            const result = await chat.sendMessage(prompt);
            const response = result.response;
            
            // Error handling sama seperti sebelumnya
            if (!response) {
                return res.status(400).send({ 
                    error: "No response generated. Content may have been blocked." 
                });
            }

            const candidates = response.candidates;
            if (!candidates || candidates.length === 0) {
                return res.status(400).send({ 
                    error: "No candidates returned." 
                });
            }

            const finishReason = candidates[0].finishReason;
            console.log('Finish reason:', finishReason);
            
            if (finishReason === 'SAFETY' || finishReason === 'RECITATION') {
                return res.status(400).send({ 
                    error: "Response blocked by safety filters.",
                    finishReason: finishReason
                });
            }

            let text;
            try {
                text = response.text();
            } catch (textError) {
                console.error('Error extracting text:', textError);
                return res.status(500).send({ 
                    error: "Failed to extract text from response.",
                    details: textError.message
                });
            }

            if (!text || text.trim() === '') {
                return res.status(400).send({ 
                    error: "Empty response generated."
                });
            }

            console.log('Response text:', text);
            res.status(200).send({ response: text });

        } else {
            // Jika tidak ada history, generate biasa
            const result = await model.generateContent(prompt);
            const response = result.response;
            
            if (!response) {
                return res.status(400).send({ 
                    error: "No response generated." 
                });
            }

            const text = response.text();
            res.status(200).send({ response: text });
        }

    } catch (error) {
        console.error("Error processing chat request:", error);
        
        if (error.message.includes('API key')) {
            return res.status(401).send({ 
                error: "Invalid API key",
                details: error.message 
            });
        }

        if (error.message.includes('quota')) {
            return res.status(429).send({ 
                error: "API quota exceeded",
                details: error.message 
            });
        }

        res.status(500).send({ 
            error: "An internal server error occurred.",
            details: error.message 
        });
    }
});

// 6. Menjalankan Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});