import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ComplaintState {
  complaintSource: string
  customerName: string
  productName: string
  productStrengthGrade: string
  batchLotNumber: string
  manufacturingDate: string
  expiryDate: string
  quantityAffected: string
  complaintType: string
  complaintDate: string
  description: string
  initialSeverity: string
  priority: string
  status: string
  rawInputText: string
  isLoading: boolean
  error: string | null
}

const initialState: ComplaintState = {
  complaintSource: '',
  customerName: '',
  productName: '',
  productStrengthGrade: '',
  batchLotNumber: '',
  manufacturingDate: '',
  expiryDate: '',
  quantityAffected: '',
  complaintType: '',
  complaintDate: '',
  description: '',
  initialSeverity: '',
  priority: '',
  status: 'Pending Triage',
  rawInputText: '',
  isLoading: false,
  error: null,
}

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    setField: (state, action: PayloadAction<{ field: keyof ComplaintState; value: string }>) => {
      const { field, value } = action.payload
      state[field] = value as string
    },
    setExtractedData: (state, action: PayloadAction<Partial<ComplaintState>>) => {
      Object.assign(state, action.payload)
    },
    resetForm: (state) => {
      return initialState
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setField, setExtractedData, resetForm, setLoading, setError } = complaintSlice.actions
export default complaintSlice.reducer
