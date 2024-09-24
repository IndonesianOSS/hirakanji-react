  import React, { useState, useRef } from 'react';
  import Swal from 'sweetalert2';
  import CategoryForm from './categoryForm';
  import fullHiraganaChart from './hiraganachart';
  import Modal from './modal';

  export default function HirakanjiType() {
    const [showModal, setShowModal] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [romajiText, setRomajiText] = useState("IndonesiaOSS");
    const [kanaInput, setKanaInput] = useState('');
    const startedSectionRef = useRef(null); // Create a ref for the started section

    // This function only handles scrolling
    function handleGetStartedClick() {
      startedSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    async function fetchText(promptText) {
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
              
              // Clean up the generated text
              generatedText = generatedText.split(/\n|Terjemahan:|Catatan:/)[0].trim();
              generatedText = generatedText.replace(/^(Teks:|Text:)/i, "").trim();

              // For romaji, ensure only valid characters are present
              if (categorySelect.value !== 'Kanji') {
                  generatedText = generatedText.replace(/[^a-zA-Z\s]/g, '');
              }

              romajiText.textContent = generatedText;
              romajiText.dataset.correctText = generatedText;
              Swal.close();
          } else {
              throw new Error('No candidates found in response');
          }
      } catch (error) {
          console.error('Error fetching text:', error);
          romajiText.textContent = "Error fetching text. Please try again.";
          Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Failed to generate new text. Please try again.'
          });
      }
  }

    async function checkUserInput(promptText) {
      const requestBody = {
        "contents": [{
          "parts": [{
            "text": promptText
          }]
        }]
      };

      try {
        const response = await fetch(geminiApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.json();
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
      {/* gw bingung her bagian image background ini anjg */}
        <section
  className="bg-center bg-cover bg-no-repeat min-h-screen flex items-center bg-gray-500"
  style={{ backgroundImage: "url(fullHiraganaChart)" }}
>
          <div className="px-4 mx-auto max-w-screen-xl text-center py-24">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl">
              Welcome to Hirakanji Type
            </h1>
            <p className="mb-8 text-lg font-normal text-gray-300 lg:text-xl sm:px-16 lg:px-48">
              Platform latihan mengetik huruf hiragana, katakana kanji dan pastinya sudah terintegrasi dengan Gemini AI untuk meningkatkan penguasaan hiragana, katakana dan kanji.
            </p>
            <p className='mb-4 text-lg font-bold text-gray'>Note: Kanji sedang dalam perbaikan!</p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
              {/* This /button will scroll to the started section */}
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                onClick={handleGetStartedClick}
              >
                Get started
              </button>
            </div>
          </div>
        </section>

        <div ref={startedSectionRef} id="started" className="min-h-screen flex items-center justify-center py-20">
          <div className="w-full max-w-lg mx-auto bg-white shadow-md rounded-lg">
            <div className="relative p-4">
              <h2 className="text-lg font-semibold text-center my-4" id="romaji-text">{romajiText}</h2>
            </div>
            <div className="p-4">
              {/* <textarea
                id="kana-input"
                placeholder="Type here..."
                className="mb-4 w-full p-2 border rounded-lg"
                value={kanaInput}
                onChange={(e) => setKanaInput(e.target.value)}
              /> */}
              <CategoryForm onAnalyze={checkUserInput} />
            </div>
          </div>
        </div>

        {showModal && <Modal analysisResult={analysisResult} onClose={() => setShowModal(false)} />}
      </>
    );
  }
