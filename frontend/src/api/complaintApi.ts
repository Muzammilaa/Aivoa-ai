const API_BASE_URL = 'http://localhost:8000'

export interface ExtractedData {
  complaint_source?: string
  customer_name?: string
  product_name?: string
  product_strength_grade?: string
  batch_lot_number?: string
  manufacturing_date?: string
  expiry_date?: string
  quantity_affected?: string
  complaint_type?: string
  complaint_date?: string
  description?: string
  initial_severity?: string
  priority?: string
}

export interface IntakeExtractResponse {
  extracted_data: ExtractedData
  parsing_errors: string[]
}

export interface ComplaintCreate {
  complaint_source: string
  customer_name: string
  product_name: string
  product_strength_grade: string
  batch_lot_number: string
  manufacturing_date: string | null
  expiry_date: string | null
  quantity_affected: string
  complaint_type: string
  complaint_date: string
  description: string
  initial_severity: string
  priority: string
  status: string
  raw_input_text: string
}

export interface ComplaintResponse extends ComplaintCreate {
  id: number
  created_at: string
}

export const complaintApi = {
  extractComplaint: async (text: string): Promise<IntakeExtractResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/intake/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to extract complaint data')
    }
    
    return response.json()
  },

  createComplaint: async (complaint: ComplaintCreate): Promise<ComplaintResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(complaint),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create complaint')
    }
    
    return response.json()
  },

  listComplaints: async (): Promise<ComplaintResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/complaints`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch complaints')
    }
    
    return response.json()
  },

  getComplaint: async (id: number): Promise<ComplaintResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/complaints/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch complaint')
    }
    
    return response.json()
  },
}
