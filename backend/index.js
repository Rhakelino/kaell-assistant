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

// 4. Inisialisasi Google Gemini AI dengan konfigurasi
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Konfigurasi model untuk respons lebih cepat
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",  // 🚀 Model paling cepat saat ini
    generationConfig: {
        temperature: 0.7,  // Lebih rendah = lebih cepat & konsisten
        topK: 20,          // Kurangi dari 40 ke 20
        topP: 0.8,         // Kurangi dari 0.95 ke 0.8
        maxOutputTokens: 150,  // Lebih sedikit = lebih cepat
        candidateCount: 1,     // Hanya 1 kandidat respons
    },
});

// Endpoint untuk test koneksi
app.get('/', (req, res) => {
    res.send('Hello from the backend! Gemini model is ready.');
});

// 5. Endpoint API untuk Chat
app.post('/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        // Validasi Input
        if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
            return res.status(400).send({ 
                error: "Input 'prompt' is required and must be a non-empty string." 
            });
        }

        // Cara yang benar memanggil generateContent
        const result = await model.generateContent(prompt);
        
        // Penanganan Respons
        if (!result.response) {
            throw new Error("No response received from Gemini API");
        }
        
        const text = result.response.text();
        res.status(200).send({ response: text });

    } catch (error) {
        console.error("Error processing chat request:", error.message);
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