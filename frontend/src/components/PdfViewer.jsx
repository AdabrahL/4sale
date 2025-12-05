import { useState, useEffect, useRef } from "react";
import "../styles/pdf-viewer.css";

/**
 * PDF Viewer Component with Read Aloud Feature
 * Supports viewing PDF files and reading text using Web Speech API
 */
export default function PdfViewer({ pdfUrl, title }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isReading, setIsReading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [readingPosition, setReadingPosition] = useState(0);
  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const speechRef = useRef(null);

  // Load PDF.js library dynamically
  useEffect(() => {
    if (!window.pdfjsLib) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        loadPdf();
      };
    } else {
      loadPdf();
    }
  }, [pdfUrl]);

  const loadPdf = async () => {
    try {
      const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);
      renderPage(1, pdf);
      extractAllText(pdf);
    } catch (error) {
      console.error("Error loading PDF:", error);
    }
  };

  const renderPage = async (pageNum, pdf = pdfDocRef.current) => {
    if (!pdf) return;
    
    const page = await pdf.getPage(pageNum);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const viewport = page.getViewport({ scale });
    const context = canvas.getContext("2d");
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
  };

  const extractAllText = async (pdf) => {
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += pageText + "\n\n";
    }
    setExtractedText(fullText);
  };

  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(currentPage);
    }
  }, [currentPage, scale]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setScale(Math.min(scale + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale - 0.25, 0.5));
  };

  const handleReadAloud = () => {
    if (!extractedText) return;

    if (isReading) {
      // Stop reading
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    // Start reading
    const utterance = new SpeechSynthesisUtterance(extractedText);
    speechRef.current = utterance;
    
    // Configure speech
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      setIsReading(true);
    };

    utterance.onend = () => {
      setIsReading(false);
      setReadingPosition(0);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsReading(false);
    };

    utterance.onboundary = (event) => {
      setReadingPosition(event.charIndex);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseResume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      window.speechSynthesis.pause();
    }
  };

  const handleStopReading = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setReadingPosition(0);
  };

  const handleSpeedChange = (newRate) => {
    if (isReading) {
      window.speechSynthesis.cancel();
      const remainingText = extractedText.substring(readingPosition);
      const utterance = new SpeechSynthesisUtterance(remainingText);
      utterance.rate = newRate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';
      
      utterance.onend = () => {
        setIsReading(false);
        setReadingPosition(0);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="pdf-viewer-container">
      <div className="pdf-viewer-header">
        <h3 className="pdf-title">{title || "PDF Viewer"}</h3>
        
        {/* Read Aloud Controls */}
        <div className="read-aloud-controls">
          <button 
            className={`read-aloud-btn ${isReading ? 'active' : ''}`}
            onClick={handleReadAloud}
            title={isReading ? "Stop Reading" : "Read Aloud"}
          >
            <i className={`fa ${isReading ? 'fa-stop' : 'fa-volume-up'}`}></i>
            <span>{isReading ? 'Stop Reading' : 'Read Aloud'}</span>
          </button>

          {isReading && (
            <>
              <button 
                className="control-btn"
                onClick={handlePauseResume}
                title="Pause/Resume"
              >
                <i className="fa fa-pause"></i>
              </button>

              <select 
                className="speed-control"
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                defaultValue="1.0"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1.0">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2.0">2x</option>
              </select>
            </>
          )}
        </div>
      </div>

      <div className="pdf-viewer-toolbar">
        <div className="page-controls">
          <button onClick={handlePrevPage} disabled={currentPage <= 1}>
            <i className="fa fa-chevron-left"></i>
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={currentPage >= totalPages}>
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>

        <div className="zoom-controls">
          <button onClick={handleZoomOut} disabled={scale <= 0.5}>
            <i className="fa fa-minus"></i>
          </button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn} disabled={scale >= 3.0}>
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      <div className="pdf-viewer-canvas-wrapper">
        <canvas ref={canvasRef} className="pdf-canvas"></canvas>
      </div>

      {isReading && (
        <div className="reading-indicator">
          <div className="reading-wave">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span>Reading...</span>
        </div>
      )}
    </div>
  );
}
