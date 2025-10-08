import React from 'react';

const WelcomeScreen = ({ setInputMessage }) => {
  const sampleQuestions = [
    'Tuliskan puisi pendek.',
    'Jelaskan teori relativitas.',
    'Buatkan kode Python untuk quicksort.',
    'Apa kabar hari ini?'
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center text-neutral-400">
      <h1 className="text-4xl font-extrabold mb-4 text-violet-400">Juju AI</h1>
      <p className="text-lg text-center mb-8 max-w-md">
        Saya siap membantu Anda dengan berbagai pertanyaan. Tanyakan apa saja!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-w-xl">
        {sampleQuestions.map(q => (
          <button
            key={q}
            onClick={() => setInputMessage(q)}
            className="bg-neutral-800 p-4 rounded-xl text-left text-sm hover:bg-neutral-700 transition-colors shadow-md"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;