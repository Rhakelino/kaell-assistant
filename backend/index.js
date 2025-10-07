// 1. Import package yang dibutuhkan
const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

// 2. Konfigurasi awal
dotenv.config(); // Memuat environment variables dari file .env
const app = express();
const port = process.env.PORT || 8000;

// 3. Middleware
app.use(cors()); // Mengaktifkan CORS agar bisa diakses frontend
app.use(express.json()); // Mengaktifkan body parser untuk menerima request body JSON

// 4. Inisialisasi Google Gemini AI
// Mengambil API Key dari environment variables
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
// --- PERUBAHAN DI SINI ---
// Menggunakan model yang lebih baru dan umum tersedia
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

// 5. Membuat Endpoint API untuk Chat
app.post('/chat', async (req, res) => {
  try {
    // 1. Validasi Input yang Lebih Kuat
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).send({ error: "Input 'prompt' is required and must be a non-empty string." });
    }

    // 2. Menghasilkan Konten
    const result = await model.generateContent(prompt);
    
    if (!result.response) {
        throw new Error("No response received from Gemini API, possibly due to safety settings.");
    }
    
    const response = result.response;
    const text = response.text();

    // Mengirimkan kembali respons dari Gemini ke frontend
    res.status(200).send({ response: text });

  } catch (error) {
    // 3. Error Handling yang Lebih Informatif
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