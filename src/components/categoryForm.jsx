import React, { useState } from 'react';
import Swal from 'sweetalert2';

export default function CategoryForm({ onAnalyze }) {

  const geminiApiUrl = `${import.meta.env.VITE_API_KEY}`;

  const [showKanji, setShowKanji] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [userInputHiragana, setUserInputHiragana] = useState(""); // State untuk Hiragana
  const [userInputRomaji, setUserInputRomaji] = useState(""); // State untuk Romaji
  const [correctText, setCorrectText] = useState("");

  const handleAnalyze = async () => {
    const categorySelect = document.getElementById('category');

    if (!categorySelect.value) {
      Swal.fire('Please select a category first.');
      return;
    }

    // Ambil input berdasarkan kategori yang dipilih
    let prompt = categorySelect.value === 'Kanji' 
      ? generateKanjiPrompt(userInputHiragana, correctText) 
      : generateHiraganaPrompt(userInputHiragana, userInputRomaji); // Gunakan userInputRomaji

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }]
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

  const generateKanjiPrompt = (userInput, correctText) => {
    return `
    Anda adalah seorang ahli konversi kanji ke hiragana dengan ketelitian tinggi. Tugas Anda adalah memverifikasi apakah kanji pengguna benar-benar sesuai dengan teks hiragana yang diberikan, tanpa membuat asumsi atau koreksi tambahan.

Kanji pengguna: "${userInput}"
Teks hiragana: "${correctText}"

Instruksi:
1. Teks hiragana tersebut anda konversikan terlebih dahulu dalam bentuk kanji kemudian konversikan kanji pengguna ke dalam bentuk hiragana, mempertahankan struktur kalimat, spasi, dan tanda baca persis seperti dalam input kanji.
2. Bandingkan hasil konversi tersebut dengan kanji yg anda konversikan sebelumnya, karakter per karakter, termasuk spasi dan tanda baca.
3. Jika dan hanya jika ada perbedaan antara hasil konversi dan teks kanji yang benar, berikan umpan balik dalam format berikut:
   - Kesalahan: [bagian kanji yang tidak sesuai setelah dikonversi ke hiragana dan apa kanji yg tepat dan benar?]
   - Seharusnya: [sarankan kanji yg tepat jika kanji pengguna salah]
   - Penjelasan: [penjelasan singkat tentang perbedaannya, fokus hanya pada perbedaan karakter]

4. Jika tidak ada perbedaan sama sekali antara hasil konversi dan teks hiragana yang diberikan, nyatakan bahwa kanji pengguna sudah benar dan sesuai serta berikan apresiasi.
5. Fokus hanya pada kesesuaian karakter per karakter antara kanji (setelah dikonversi ke hiragana) dan teks hiragana yang diberikan. Jangan mempertimbangkan tata bahasa, makna, atau aturan penulisan lainnya.
6. Jangan membuat asumsi tentang pemisahan kata, bentuk konjugasi, atau perubahan bentuk lainnya. Konversi harus dilakukan secara harfiah, karakter per karakter.
7. Lakukan verifikasi ganda sebelum memberikan umpan balik untuk memastikan keakuratan analisis Anda.
8. Gunakan bahasa Indonesia yang formal dan mudah dipahami dalam penjelasan Anda.
9. Berikan terjemahan bahasa Indonesia dari teks kanji yang diinputkan.

Penting: Jangan membuat asumsi atau koreksi di luar apa yang diberikan dalam input. Tujuan utama adalah memverifikasi kesesuaian karakter per karakter antara kanji (setelah dikonversi ke hiragana) dan teks hiragana yang diberikan.
Berikan analisis Anda secara ringkas dan akurat.
    `;
  };

  const generateHiraganaPrompt = (userInput, correctText) => {
    return `
      Anda adalah seorang guru pendidikan bahasa jepang sekaligus ahli konversi hiragana ke romaji dengan ketelitian tinggi. Tugas Anda adalah memverifikasi apakah hiragana pengguna benar-benar sesuai dengan teks romaji yang diberikan, tanpa membuat asumsi atau koreksi tambahan.

Hiragana pengguna: "${userInput}"
Teks romaji: "${correctText}"

Instruksi:
1. Konversikan  hiragana pengguna ke dalam bentuk romaji.
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
      <div>
        <label htmlFor="lengt-text" className="block mb-1 font-semibold">Category text:</label>
        <select 
          id="lengt-text" 
          className="block w-full p-2 border rounded-lg"
          onChange={(e) => setCorrectText(e.target.value)} // Store correct text based on selection
        >
          <option value="">Category text</option>
          <option value="satukalimatsaja">Kalimat Pendek</option>
          <option value="textwacana5kalimatmudah">Teks wacana - Easy</option>
          <option value="textwacana5kalimatmedium">Teks wacana - Medium</option>
          <option value="textwacana5kalimatdifficult">Teks wacana - Difficult</option>
        </select>
      </div>

      {showKanji && (
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
      )}

      {!showKanji && (
        <div>
          <label htmlFor="userInputHiragana" className="block mb-1 font-semibold">Input Hiragana:</label>
          <input 
            type="text" 
            id="userInputHiragana" 
            value={userInputHiragana} 
            onChange={(e) => setUserInputHiragana(e.target.value)} 
            className="block w-full p-2 border rounded-lg" 
          />
          
          <label htmlFor="userInputRomaji" className="block mb-1 font-semibold mt-4">Input Romaji:</label>
          <input 
            type="text" 
            id="userInputRomaji" 
            value={userInputRomaji} 
            onChange={(e) => setUserInputRomaji(e.target.value)} 
            className="block w-full p-2 border rounded-lg" 
          />
        </div>
      )}

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
