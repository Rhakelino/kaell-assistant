const API_URL = 'https://kaell-assistant-api.vercel.app/chat'; // URL backend kita

/**
 * Mengirimkan pesan ke backend dan mengembalikan respons dari AI.
 * @param {Object} params Parameter untuk request
 * @param {string} params.prompt Pesan yang akan dikirim
 * @param {Array} params.history Riwayat chat (opsional)
 * @param {AbortSignal} params.signal Signal untuk membatalkan request (opsional)
 * @returns {Promise<Object>} Respons dari AI
 */
export const sendMessageToAI = async ({ prompt, history = [], signal = null }) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ prompt, history }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Network response was not ok');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("API call failed:", error);
    if (error.name === 'AbortError') {
      throw error;
    }
    throw new Error(error.message || 'Failed to get a response from the server');
  }
};