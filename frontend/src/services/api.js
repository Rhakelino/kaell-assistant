/**
 * Alamat base URL untuk API backend.
 * Saat development, ia akan menunjuk ke proxy Vite ('/chat').
 * Saat production (online di Vercel), ia akan menunjuk ke URL backend kita yang sebenarnya.
 */
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://kaell-assistant-api.vercel.app' // <-- GANTI DENGAN URL BACKEND ANDA
  : '';

/**
 * Mengirimkan pesan ke backend dan mengembalikan respons dari AI.
 * @param {string} prompt Pesan yang akan dikirim.
 * @returns {Promise<string>} Respons teks dari AI.
 */
export const sendMessageToAI = async (prompt) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Network response was not ok.');
    }

    const data = await response.json();
    return data.response;

  } catch (error) {
    console.error("API call failed:", error);
    throw new Error(error.message || 'Failed to get a response from the server.');
  }
};

