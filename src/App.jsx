// src/App.jsx
import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [markdown, setMarkdown] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (file) => {
    if (!file) return
    
    if (!file.type.includes('pdf')) {
      alert('Please select a PDF file')
      return
    }
    
    setIsLoading(true)
    const formData = new FormData()
    formData.append('pdf', file)

    try {
      const response = await fetch('http://192.168.68.85:6201/convert', {
        method: 'POST',
        body: formData
      })
      const data = await response.text()
      setMarkdown(data)
    } catch (err) {
      console.error(err)
      alert('Error converting PDF. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    await handleFileSelect(file)
  }

  const handleFileInput = async (e) => {
    const file = e.target.files[0]
    await handleFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const copyToClipboard = () => {
    try {
      // Create temporary textarea
      const textArea = document.createElement('textarea');
      textArea.value = markdown;
      
      // Make it invisible but keep it in the document flow
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      
      // Select and copy
      textArea.select();
      document.execCommand('copy');
      
      // Clean up
      document.body.removeChild(textArea);
      
      // Show feedback
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard: ' + err.message);
    }
  };

  return (
    <div className="container">
      <div className="app-wrapper">
        <div className="header">
          <h1>PDF to Markdown Converter</h1>
          <p>Drop your PDF file below to convert it to Markdown format</p>
        </div>

        <div 
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileInput}
            accept=".pdf"
            style={{ display: 'none' }}
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <p>Drop your PDF here</p>
          <span className="sub-text">or click to select a file</span>
        </div>

        {isLoading && (
          <div className="loading">
            Converting PDF to Markdown...
          </div>
        )}

        {markdown && !isLoading && (
          <div className="markdown-container">
            <div className="markdown-header">
              <h3>Converted Markdown</h3>
              <button 
                onClick={copyToClipboard} 
                className={`copy-button ${isCopied ? 'copied' : ''}`}
              >
                {isCopied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="markdown-content">
              <pre>{markdown}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App