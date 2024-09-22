import React, { useState } from 'react';
import Swal from 'sweetalert2';

const geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCqIqw-XVWls3FcH6_4Vm-xMyoGWPZ4CTk";

export default function HirakanjiType() {
  const [showModal, setShowModal] = useState(false);
  const [showKanji, setShowKanji] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [romajiText, setRomajiText] = useState("Loading...");
  const [kanaInput, setKanaInput] = useState('');

  async function fetchText() {
    const categorySelect = document.getElementById('category');
    const kanjiLevelSelect = document.getElementById('level-kanji');
    const lengthTextSelect = document.getElementById('lengt-text');

    if (categorySelect.value === '') {
      alert("Please select a category first.");
      return;
    }

    let promptText;
    if (categorySelect.value === 'Kanji') {
      promptText = `Berikan teks 読解 level JLPT ${kanjiLevelSelect.value} singkat ${lengthTextSelect.value} bahasa Jepang dalam bentuk hiragana murni tanpa ada campuran kanji.`;
    } else {
      promptText = `Berikan teks 読解 singkat ${lengthTextSelect.value} bahasa Jepang acak dalam huruf romaji saja.`;
    }

    const requestBody = {
      "contents": [{
        "parts": [{
          "text": promptText
        }]
      }]
    };

    try {
      Swal.fire({
        title: 'Generating new text...',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.candidates && data.candidates.length > 0) {
        let generatedText = data.candidates[0].content.parts[0].text;
        generatedText = generatedText.split(/\n|Terjemahan:|Catatan:/)[0].trim();
        setRomajiText(generatedText);
        Swal.close();
      } else {
        throw new Error('No candidates found in response');
      }
    } catch (error) {
      console.error('Error fetching text:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to generate new text. Please try again.'
      });
    }
  }

  async function checkUserInput() {
    const correctText = romajiText; // Assume this is the generated text
    const userInput = kanaInput; // Get user input from textarea
  
    if (!userInput.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Input Required',
        text: 'Please enter your input before analyzing.'
      });
      return;
    }
  
    let prompt;
    const categorySelect = document.getElementById('category');
  
    if (categorySelect.value === 'Kanji') {
      prompt = `Anda adalah seorang ahli konversi kanji ke hiragana. 
      Kanji pengguna: "${userInput}" 
      Teks hiragana: "${correctText}" 
      ... (petunjuk lainnya)`;
    } else {
      prompt = `Anda adalah seorang guru pendidikan bahasa Jepang. 
      Hiragana pengguna: "${userInput}" 
      Teks romaji: "${correctText}" 
      ... (petunjuk lainnya)`;
    }
  
    try {
      const requestBody = {
        "contents": [{
          "parts": [{
            "text": prompt
          }]
        }]
      };
  
      const response = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        const errorData = await response.json(); // Ambil data kesalahan dari respons
        console.error('Error checking user input:', errorData);
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
      }
  
      const data = await response.json();
      if (data && data.candidates && data.candidates.length > 0) {
        setAnalysisResult(data.candidates[0].content.parts[0].text);
      } else {
        setAnalysisResult("No analysis result available.");
      }
      setShowModal(true);
    } catch (error) {
      console.error('Error checking user input:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to analyze your input. Please try again. Error: ' + error.message
      });
    }
  }
  

  return (
    <>
      <section 
        className="bg-center bg-cover bg-no-repeat bg-gray-700 min-h-screen flex items-center"
        style={{ backgroundImage: "url('img/baner.jpeg')" }}
      >
        <div className="px-4 mx-auto max-w-screen-xl text-center py-24">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl">
            Welcome to Hirakanji Type
          </h1>
          <p className="mb-8 text-lg font-normal text-gray-300 lg:text-xl sm:px-16 lg:px-48">
            Platform latihan mengetik huruf hiragana, katakana kanji dan pastinya sudah terintegrasi dengan Gemini AI untuk meningkatkan penguasaan hiragana, katakana dan kanji.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
              onClick={fetchText}
            >
              Get started
            </button>
            <button 
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
              onClick={() => alert('Guide clicked')}
            >
              Guide
            </button>
          </div>
        </div>
      </section>

      <div id="started" className="min-h-screen flex items-center justify-center py-20">
        <div className="w-full max-w-lg mx-auto bg-white shadow-md rounded-lg">
          <div className="relative p-4">
            <h2 className="text-lg font-semibold text-center my-4" id="romaji-text">{romajiText}</h2>
          </div>
          <div className="p-4">
            <textarea 
              id="kana-input" 
              placeholder="Type here..." 
              className="mb-4 w-full p-2 border rounded-lg" 
              value={kanaInput} 
              onChange={(e) => setKanaInput(e.target.value)} 
            />
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
                <select id="lengt-text" className="block w-full p-2 border rounded-lg">
                  <option value="">Category text</option>
                  <option value="satukalimatsaja">Kalimat Pendek</option>
                  <option value="textwacana5kalimatmudah">Teks wacana - Easy</option>
                  <option value="textwacana5kalimatmedium">Teks wacana - Medium</option>
                  <option value="textwacana5kalimatkompleks">Teks wacana - Kompleks</option>
                </select>
              </div>
              {showKanji && (
                <div>
                  <label htmlFor="level-kanji" className="block mb-1 font-semibold">Level Kanji:</label>
                  <select id="level-kanji" className="block w-full p-2 border rounded-lg">
                    <option value="">Level Kanji</option>
                    <option value="N3">N3</option>
                    <option value="N4">N4</option>
                    <option value="N5">N5</option>
                  </select>
                </div>
              )}
              <button 
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
                onClick={checkUserInput}
              >
                Analyze
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg">
            <div className="p-4">
              <h3 className="text-lg font-bold">Analysis Result
              </h3>
              <p className="mt-2">{analysisResult}</p>
              <div className="mt-4 flex justify-end">
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
