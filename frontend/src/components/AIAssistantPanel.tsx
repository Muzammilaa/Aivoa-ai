import React, { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setExtractedData, setLoading, setError } from '../store/complaintSlice'
import { RootState, AppDispatch } from '../store/store'
import { complaintApi } from '../api/complaintApi'
import './AIAssistantPanel.css'

const AIAssistantPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const complaint = useSelector((state: RootState) => state.complaint)
  const [text, setText] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = async (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setText(content)
    }
    reader.readAsText(file)
  }

  const handleExtract = async () => {
    if (!text.trim()) {
      dispatch(setError('Please enter complaint text or upload a file'))
      return
    }

    dispatch(setLoading(true))
    dispatch(setError(null))

    try {
      const result = await complaintApi.extractComplaint(text)
      
      // Map backend field names to frontend field names
      const mappedData = {
        complaintSource: result.extracted_data.complaint_source || '',
        customerName: result.extracted_data.customer_name || '',
        productName: result.extracted_data.product_name || '',
        productStrengthGrade: result.extracted_data.product_strength_grade || '',
        batchLotNumber: result.extracted_data.batch_lot_number || '',
        manufacturingDate: result.extracted_data.manufacturing_date || '',
        expiryDate: result.extracted_data.expiry_date || '',
        quantityAffected: result.extracted_data.quantity_affected || '',
        complaintType: result.extracted_data.complaint_type || '',
        complaintDate: result.extracted_data.complaint_date || '',
        description: result.extracted_data.description || text,
        initialSeverity: result.extracted_data.initial_severity || '',
        priority: result.extracted_data.priority || '',
        status: 'Pending Triage',
        rawInputText: text,
      }
      
      dispatch(setExtractedData(mappedData))
    } catch (error) {
      dispatch(setError('Failed to extract complaint data. Please try again.'))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handlePaste = () => {
    navigator.clipboard.readText().then((clipboardText) => {
      setText(clipboardText)
    }).catch(() => {
      dispatch(setError('Failed to read clipboard'))
    })
  }

  return (
    <div className="ai-assistant-panel">
      <h2>AI Assistant</h2>
      
      <div 
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <svg className="upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p>Drag and drop a file here</p>
          <p className="upload-subtext">or</p>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept=".txt,.pdf,.doc,.docx"
          />
        </div>
      </div>

      <div className="paste-section">
        <div className="paste-header">
          <h3>Paste Complaint Text</h3>
          <button className="btn btn-small btn-secondary" onClick={handlePaste}>
            Paste from Clipboard
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste customer complaint text here..."
          rows={6}
          className="paste-textarea"
        />
      </div>

      <button 
        className="btn btn-primary btn-full" 
        onClick={handleExtract}
        disabled={complaint.isLoading || !text.trim()}
      >
        {complaint.isLoading ? 'Extracting...' : 'Extract with AI'}
      </button>

      {complaint.error && (
        <div className="error-message">
          {complaint.error}
        </div>
      )}

      {complaint.isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>AI is analyzing the complaint...</p>
        </div>
      )}

      <div className="chat-section">
        <h3>Ask About This Complaint</h3>
        <div className="chat-box">
          <textarea
            placeholder="Ask a question about the current complaint..."
            rows={3}
            className="chat-input"
          />
          <button className="btn btn-primary btn-small">Ask</button>
        </div>
      </div>
    </div>
  )
}

export default AIAssistantPanel
