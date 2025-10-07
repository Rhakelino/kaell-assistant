import { useState } from 'react';
import { sendMessageToAI } from './services/api';
// Kita akan hapus CSS default nanti jika tidak perlu

function App() {
  // State untuk menyimpan prompt yang sedang diketik
  const [prompt, setPrompt] = useState('');
  // State untuk menyimpan balasan dari AI
  const [response, setResponse] = useState('');
  // State untuk loading indicator
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      // <-- 2. GUNAKAN FUNGSI YANG SUDAH DI-IMPORT
      // Semua logika fetch yang panjang sekarang digantikan oleh satu baris ini.
      const aiResponse = await sendMessageToAI(prompt);
      
      setResponse(aiResponse); // Simpan balasan AI ke state

    } catch (error) {
      console.error(error);
      // Tampilkan pesan error yang lebih informatif dari modul API kita
      setResponse(error.message); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8">Ask Kaell Anything</h1>
        
        <form onSubmit={handleSubmit} className="w-full">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt here..."
            className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            rows="4"
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-600"
            disabled={loading}
          >
            {loading ? 'Thinking...' : 'Send Prompt'}
          </button>
        </form>

        {response && (
          <div className="mt-8 w-full bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Response:</h2>
            <p className="text-lg whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

