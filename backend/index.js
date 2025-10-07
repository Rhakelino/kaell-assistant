// 1. Import package yang dibutuhkan
const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

// 2. Konfigurasi awal
dotenv.config(); // Memuat environment variables dari file .env
const app = express();
const port = process.env.PORT || 8000;

// --- PERBAIKAN CORS DI SINI ---
// Daftar alamat (origin) yang diizinkan untuk mengakses backend ini
const allowedOrigins = [
  'https://kaell-assistant.vercel.app' // <-- GANTI DENGAN URL FRONTEND ANDA JIKA BERBEDA
];

const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan jika origin ada di dalam daftar, atau jika tidak ada origin (seperti saat tes dengan Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};

// 3. Middleware
app.use(cors(corsOptions)); // Menggunakan konfigurasi CORS yang sudah kita buat
app.use(express.json()); // Mengaktifkan body parser untuk menerima request body JSON

// 4. Inisialisasi Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

// 5. Membuat Endpoint API untuk Chat
app.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).send({ error: "Input 'prompt' is required and must be a non-empty string." });
    }

    const result = await model.generateContent(prompt);
    
    if (!result.response) {
        throw new Error("No response received from Gemini API, possibly due to safety settings.");
    }
    
    const response = result.response;
    const text = response.text();

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
// Vercel akan menangani ini, jadi baris app.listen tidak akan berjalan di produksi
// Tapi kita tetap membutuhkannya untuk development lokal
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

// Ekspor app untuk Vercel
module.exports = app;

