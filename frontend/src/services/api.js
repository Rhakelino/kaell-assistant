const API_URL = 'https://kaell-assistant-api.vercel.app/'; // URL backend kita

/**
 * Mengirimkan pesan ke backend dan mengembalikan respons dari AI.
 * @param {string} prompt Pesan yang akan dikirim.
 * @returns {Promise<string>} Respons teks dari AI.
 */
export const sendMessageToAI = async (prompt) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      // Jika respons dari server adalah error (misal: 500, 404)
      throw new Error('Network response was not ok.');
    }

    const data = await response.json();
    return data.response;

  } catch (error) {
    console.error("API call failed:", error);
    // Lemparkan error lagi agar bisa ditangkap oleh komponen yang memanggil
    throw new Error('Failed to get a response from the server. Please check if the backend is running.');
  }
};