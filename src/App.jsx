// src/App.jsx
import { useState, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import './App.css'
import './components/LoadingStyles.css'

function App() {
  const [markdown, setMarkdown] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [history, setHistory] = useState([])
  const [selectedHistoryId, setSelectedHistoryId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentFile, setCurrentFile] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const fileInputRef = useRef(null)

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('pdf2md-history')
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory)
        setHistory(parsedHistory)
      } catch (error) {
        console.error('Error loading history:', error)
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pdf2md-history', JSON.stringify(history))
  }, [history])

  const addToHistory = (conversionData) => {
    const historyItem = {
      id: Date.now(),
      filename: conversionData.filename,
      markdown: conversionData.markdown,
      fileSize: conversionData.fileSize,
      pageCount: conversionData.pageCount,
      timestamp: conversionData.timestamp
    }

    setHistory(prevHistory => {
      const newHistory = [historyItem, ...prevHistory]
      // Keep only the last 50 items
      return newHistory.slice(0, 50)
    })

    setSelectedHistoryId(historyItem.id)
  }

  const pollProgress = async (conversionId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://192.168.68.85:6201/progress/${conversionId}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const progressData = await response.json()
        
        // Update progress state
        setLoadingProgress(progressData.progress || 0)
        setLoadingStage(progressData.stage || 'Processing...')
        setTotalPages(progressData.total_pages || 0)
        setCurrentPage(progressData.current_page || 0)
        
        // Check if conversion is complete
        if (progressData.status === 'completed' && progressData.result) {
          clearInterval(pollInterval)
          setMarkdown(progressData.result.markdown)
          addToHistory(progressData.result)
          
          // Reset loading state after a brief delay
          setTimeout(() => {
            setIsLoading(false)
            setCurrentFile(null)
            setLoadingProgress(0)
            setLoadingStage('')
            setTotalPages(0)
            setCurrentPage(0)
          }, 1000)
        } else if (progressData.status === 'error') {
          clearInterval(pollInterval)
          alert(`Conversion failed: ${progressData.error}`)
          setIsLoading(false)
          setCurrentFile(null)
          setLoadingProgress(0)
          setLoadingStage('')
          setTotalPages(0)
          setCurrentPage(0)
        }
        
      } catch (error) {
        console.error('Error polling progress:', error)
        clearInterval(pollInterval)
        alert('Error checking conversion progress. Please try again.')
        setIsLoading(false)
        setCurrentFile(null)
        setLoadingProgress(0)
        setLoadingStage('')
        setTotalPages(0)
        setCurrentPage(0)
      }
    }, 500) // Poll every 500ms for smooth progress updates
    
    return pollInterval
  }

  const handleFileSelect = async (file) => {
    if (!file) return
    
    if (!file.type.includes('pdf')) {
      alert('Please select a PDF file')
      return
    }
    
    setIsLoading(true)
    setCurrentFile(file)
    setLoadingProgress(0)
    setLoadingStage('Uploading file...')
    
    const formData = new FormData()
    formData.append('pdf', file)

    try {
      const response = await fetch('http://192.168.68.85:6201/convert', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.conversion_id) {
        // Start polling for progress
        pollProgress(data.conversion_id)
      } else {
        throw new Error(data.error || 'Conversion failed to start')
      }
    } catch (err) {
      console.error(err)
      alert('Error starting PDF conversion. Please try again.')
      setIsLoading(false)
      setCurrentFile(null)
      setLoadingProgress(0)
      setLoadingStage('')
      setTotalPages(0)
      setCurrentPage(0)
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

  const handleSelectHistory = (historyItem) => {
    setMarkdown(historyItem.markdown)
    setSelectedHistoryId(historyItem.id)
  }

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all conversion history? This action cannot be undone.')) {
      setHistory([])
      setSelectedHistoryId(null)
      localStorage.removeItem('pdf2md-history')
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
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
    <div className="app-layout">
      {sidebarOpen && (
        <Sidebar
          history={history}
          onSelectHistory={handleSelectHistory}
          selectedHistoryId={selectedHistoryId}
          onClearHistory={handleClearHistory}
        />
      )}
      
      <div className={`main-content ${sidebarOpen ? 'with-sidebar' : ''}`}>
        <div className="top-bar">
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="app-title">
            <h1>PDF to Markdown Converter</h1>
          </div>
        </div>

        <div className="container">
          <div className="app-wrapper">
            <div className="header">
              <p>Drop your PDF file below to convert it to Markdown format</p>
            </div>

            <div 
              className={`drop-zone ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onClick={() => !isLoading && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileInput}
                accept=".pdf"
                style={{ display: 'none' }}
                disabled={isLoading}
              />
              
              {isLoading ? (
                <div className="loading-content">
                  <div className="loading-visual">
                    <div className="loading-spinner"></div>
                    <div className="progress-ring">
                      <svg className="progress-circle" viewBox="0 0 120 120">
                        <circle
                          className="progress-circle-bg"
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="rgba(59, 130, 246, 0.1)"
                          strokeWidth="8"
                        />
                        <circle
                          className="progress-circle-fill"
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 50}`}
                          strokeDashoffset={`${2 * Math.PI * 50 * (1 - loadingProgress / 100)}`}
                          transform="rotate(-90 60 60)"
                        />
                      </svg>
                      <div className="progress-percentage">{loadingProgress}%</div>
                    </div>
                  </div>
                  <div className="loading-text">
                    <p>{loadingStage}</p>
                    {currentFile && (
                      <div className="file-info">
                        <span className="filename">📄 {currentFile.name}</span>
                        <span className="file-size">
                          {(currentFile.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                        {totalPages > 0 && (
                          <span className="page-info">
                            {currentPage > 0 ? `Page ${currentPage} of ${totalPages}` : `${totalPages} pages total`}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <p>Drop your PDF here</p>
                  <span className="sub-text">or click to select a file</span>
                </>
              )}
            </div>

            {markdown && !isLoading && (
              <div className="markdown-container">
                <div className="markdown-header">
                  <h3>Converted Markdown</h3>
                  <div className="markdown-actions">
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
                </div>
                <div className="markdown-content">
                  <pre>{markdown}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
