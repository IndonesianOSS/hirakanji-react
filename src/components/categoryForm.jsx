import React, { useState } from 'react';
import Swal from 'sweetalert2';

export default function CategoryForm({ onAnalyze }) {
  const geminiApiUrl = `${import.meta.env.VITE_API_KEY}`;
  const [showKanji, setShowKanji] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [userInputHiragana, setUserInputHiragana] = useState(""); // State for Hiragana input
  const [kanjiLevelSelect, setKanjiLevelSelect] = useState(""); // State for Kanji level selection
  const [lengthTextSelect, setLengthTextSelect] = useState(""); // State for length text selection

  const handleAnalyze = async () => {
    const categorySelect = document.getElementById('category');

    if (!categorySelect.value) {
      Swal.fire('Please select a category first.');
      return;
    }

    // Generate the appropriate prompt based on category and user input
    let promptText;
    if (categorySelect.value === 'Kanji') {
      promptText = `Berikan teks 読解  level JLPT ${kanjiLevelSelect} singkat ${lengthTextSelect} bahasa Jepang dalam bentuk hiragana murni tanpa ada campuran kanji. Berikan hanya teks Jepang tanpa terjemahan atau penjelasan tambahan.`;
    } else {
      promptText = `Anda adalah seorang guru pendidikan bahasa Jepang sekaligus ahli konversi hiragana ke romaji. Tugas Anda adalah mengkonversi hiragana pengguna ke dalam romaji.

      Hiragana pengguna: "${userInputHiragana}"

      Instruksi:
      1. Konversikan hiragana pengguna ke dalam romaji.
      2. Bandingkan hasil konversi tersebut dengan teks romaji yang benar, karakter per karakter.
3. Jika dan hanya jika ada perbedaan antara hasil konversi dan teks romaji yang benar, berikan umpan balik dalam format berikut:
   - Kesalahan: [bagian hiragana yang tidak sesuai]
   - Seharusnya: [bagian romaji yang benar]
   - Penjelasan: [penjelasan singkat tentang perbedaannya]

4. Jika tidak ada perbedaan sama sekali, nyatakan bahwa hiragana pengguna sudah benar dan sesuai dengan teks romaji yang diberikan.
5. Fokus hanya pada kesesuaian antara hiragana dan romaji, bukan pada tata bahasa atau makna.
6. Lakukan verifikasi ganda sebelum memberikan umpan balik untuk memastikan keakuratan analisis Anda.
7. Gunakan bahasa Indonesia yang formal dan mudah dipahami dalam penjelasan Anda.
8. Berikan terjemahan bahasa indonesia dari teks hiragana yg di inputkan 

Penting: Jangan membuat asumsi atau koreksi di luar apa yang diberikan dalam input. Tujuan utama adalah memverifikasi kesesuaian antara hiragana dan teks romaji yang diberikan.

Berikan analisis Anda secara ringkas dan akurat.
      `;
    }

    const requestBody = {
      contents: [{ parts: [{ text: promptText }] }],
    };

    try {
      Swal.fire({
        title: 'Analyzing...',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => Swal.showLoading(),
      });

      const response = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      handleResponse(data);
    } catch (error) {
      console.error('Error fetching text:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to analyze input. Please try again.',
      });
    }
  };

  const handleResponse = (data) => {
    if (data && data.candidates && data.candidates.length > 0) {
      const analysisResultText = formatAnalysisResult(data.candidates[0].content.parts[0].text);
      setAnalysisResult(analysisResultText);
      Swal.close();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'No analysis found',
        text: 'Please try a different input.',
      });
    }
  };

  const formatAnalysisResult = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/~~(.*?)~~/g, '<s>$1</s>')
      .replace(/^#\s+(.*)/gm, '<h1>$1</h1>')
      .replace(/^##\s+(.*)/gm, '<h2>$1</h2>')
      .replace(/^###\s+(.*)/gm, '<h3>$1</h3>')
      .replace(/^>\s+(.*)/gm, '<blockquote>$1</blockquote>')
      .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
      .replace(/\n(?!<\/?(h1|h2|h3|blockquote|pre|code)>)/g, '<br>');
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="category" className="block mb-1 font-semibold">Choose Category:</label>
        <select 
          id="category" 
          onChange={(e) => setShowKanji(e.target.value === "Kanji")}
          className="block w-full p-2 border rounded-lg"
        >
          <option value="">Select Category</option>
          <option value="hiragana-katakana">Hiragana & Katakana</option>
          <option value="Kanji">Kanji</option>
        </select>
      </div>

      {showKanji && (
        <div>
          <label htmlFor="kanji-level" className="block mb-1 font-semibold">Kanji Level:</label>
          <select 
            id="kanji-level" 
            onChange={(e) => setKanjiLevelSelect(e.target.value)}
            className="block w-full p-2 border rounded-lg"
          >
            <option value="">Select Level</option>
            <option value="N5">N5</option>
            <option value="N4">N4</option>
            <option value="N3">N3</option>
            <option value="N2">N2</option>
            <option value="N1">N1</option>
          </select>
        </div>
      )}

      <div>
        <label htmlFor="lengt-text" className="block mb-1 font-semibold">Category text:</label>
        <select 
          id="lengt-text" 
          className="block w-full p-2 border rounded-lg"
          onChange={(e) => setLengthTextSelect(e.target.value)} // Store correct text based on selection
        >
          <option value="">Category text</option>
          <option value="satukalimatsaja">Kalimat Pendek</option>
          <option value="textwacana5kalimatmudah">Teks wacana - Easy</option>
          <option value="textwacana5kalimatmedium">Teks wacana - Medium</option>
          <option value="textwacana5kalimatdifficult">Teks wacana - Difficult</option>
        </select>
      </div>

      <div>
        <label htmlFor="userInputHiragana" className="block mb-1 font-semibold">Input Hiragana:</label>
        <input 
          type="text" 
          id="userInputHiragana" 
          value={userInputHiragana} 
          onChange={(e) => setUserInputHiragana(e.target.value)} 
          className="block w-full p-2 border rounded-lg" 
        />
      </div>

      <button 
        onClick={handleAnalyze} 
        className="w-full py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Analyze
      </button>

      {analysisResult && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold">Analysis Result:</h3>
          <div dangerouslySetInnerHTML={{ __html: analysisResult }} />
        </div>
      )}
    </div>
  );
}
