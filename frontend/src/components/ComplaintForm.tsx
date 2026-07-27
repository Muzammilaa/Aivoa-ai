import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setField, resetForm, setLoading, setError } from '../store/complaintSlice'
import { RootState, AppDispatch } from '../store/store'
import { complaintApi, ComplaintCreate } from '../api/complaintApi'
import './ComplaintForm.css'

const ComplaintForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const complaint = useSelector((state: RootState) => state.complaint)

  const handleFieldChange = (field: string, value: string) => {
    dispatch(setField({ field: field as any, value }))
  }

  const handleReset = () => {
    dispatch(resetForm())
  }

  const handleSave = async () => {
    if (!complaint.customerName || !complaint.productName || !complaint.description) {
      dispatch(setError('Please fill in required fields: Customer Name, Product Name, and Description'))
      return
    }

    dispatch(setLoading(true))
    dispatch(setError(null))

    try {
      const complaintData: ComplaintCreate = {
        complaint_source: complaint.complaintSource,
        customer_name: complaint.customerName,
        product_name: complaint.productName,
        product_strength_grade: complaint.productStrengthGrade,
        batch_lot_number: complaint.batchLotNumber,
        manufacturing_date: complaint.manufacturingDate || null,
        expiry_date: complaint.expiryDate || null,
        quantity_affected: complaint.quantityAffected,
        complaint_type: complaint.complaintType,
        complaint_date: complaint.complaintDate,
        description: complaint.description,
        initial_severity: complaint.initialSeverity,
        priority: complaint.priority,
        status: complaint.status,
        raw_input_text: complaint.rawInputText,
      }

      const savedComplaint = await complaintApi.createComplaint(complaintData)
      alert(`Complaint saved successfully with ID: ${savedComplaint.id}`)
      dispatch(resetForm())
    } catch (error) {
      dispatch(setError('Failed to save complaint. Please try again.'))
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="complaint-form">
      <h2>Complaint Form</h2>
      
      {complaint.error && (
        <div className="error-message">
          {complaint.error}
        </div>
      )}
      
      {/* Origin & Customer Details */}
      <section className="form-section">
        <h3>Origin & Customer Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="complaintSource">Complaint Source</label>
            <select
              id="complaintSource"
              value={complaint.complaintSource}
              onChange={(e) => handleFieldChange('complaintSource', e.target.value)}
            >
              <option value="">Select source</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="portal">Portal</option>
              <option value="letter">Letter</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="customerName">Customer Name</label>
            <input
              type="text"
              id="customerName"
              value={complaint.customerName}
              onChange={(e) => handleFieldChange('customerName', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Product & Batch Identification */}
      <section className="form-section">
        <h3>Product & Batch Identification</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="productName">Product Name</label>
            <input
              type="text"
              id="productName"
              value={complaint.productName}
              onChange={(e) => handleFieldChange('productName', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="productStrengthGrade">Product Strength/Grade</label>
            <input
              type="text"
              id="productStrengthGrade"
              value={complaint.productStrengthGrade}
              onChange={(e) => handleFieldChange('productStrengthGrade', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="batchLotNumber">Batch/Lot Number</label>
            <input
              type="text"
              id="batchLotNumber"
              value={complaint.batchLotNumber}
              onChange={(e) => handleFieldChange('batchLotNumber', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="manufacturingDate">Manufacturing Date</label>
            <input
              type="date"
              id="manufacturingDate"
              value={complaint.manufacturingDate}
              onChange={(e) => handleFieldChange('manufacturingDate', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              type="date"
              id="expiryDate"
              value={complaint.expiryDate}
              onChange={(e) => handleFieldChange('expiryDate', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="quantityAffected">Quantity Affected</label>
            <input
              type="text"
              id="quantityAffected"
              value={complaint.quantityAffected}
              onChange={(e) => handleFieldChange('quantityAffected', e.target.value)}
              placeholder="e.g., 50 kg"
            />
          </div>
        </div>
      </section>

      {/* Complaint Details */}
      <section className="form-section">
        <h3>Complaint Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="complaintType">Complaint Type</label>
            <select
              id="complaintType"
              value={complaint.complaintType}
              onChange={(e) => handleFieldChange('complaintType', e.target.value)}
            >
              <option value="">Select type</option>
              <option value="quality">Quality Issue</option>
              <option value="packaging">Packaging Defect</option>
              <option value="efficacy">Efficacy Concern</option>
              <option value="safety">Safety Issue</option>
              <option value="documentation">Documentation Error</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="complaintDate">Complaint Date</label>
            <input
              type="date"
              id="complaintDate"
              value={complaint.complaintDate}
              onChange={(e) => handleFieldChange('complaintDate', e.target.value)}
            />
          </div>
        </div>
        <div className="form-group full-width">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={complaint.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            rows={5}
          />
        </div>
      </section>

      {/* Initial Assessment & Priority */}
      <section className="form-section">
        <h3>Initial Assessment & Priority</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="initialSeverity">Initial Severity</label>
            <select
              id="initialSeverity"
              value={complaint.initialSeverity}
              onChange={(e) => handleFieldChange('initialSeverity', e.target.value)}
            >
              <option value="">Select severity</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={complaint.priority}
              onChange={(e) => handleFieldChange('priority', e.target.value)}
            >
              <option value="">Select priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <input
            type="text"
            id="status"
            value={complaint.status}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            disabled
          />
        </div>
      </section>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          Reset Form
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          Save Complaint
        </button>
      </div>
    </div>
  )
}

export default ComplaintForm
