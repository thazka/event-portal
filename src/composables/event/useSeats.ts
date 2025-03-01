import { useApi } from "/@src/composables/auth/useApi";
import { useSeats } from "/@src/stores/event/seats";

const api = useApi()
const { seatList } = useSeats()

export const fetchSeatList = async (params: any) => {
    try {
        seatList.isLoading = true
        seatList.isError = false
        seatList.data = []

        const { data } = await api.get('/v1/seat', { params })
        
        if (!data.status) {
            seatList.data = []
            seatList.isLoading = false
            seatList.isError = true
            throw new Error("Failed to fetch seat list");
        }

        seatList.data = data.data
        seatList.pagination = data.pagination
        seatList.isLoading = false
        seatList.isError = false
        
    } catch (error) {
        seatList.data = []
        seatList.isLoading = false
        seatList.isError = true

        return error
    }
}

export const storeSeat = async (params: any) => {
    try {
        const { data } = await api.post('/v1/seat', params)

        return data
    } catch (error) {
        return error
    }
}

export const updateSeat = async (id: number, params: any) => {
    try {
        const { data } = await api.put(`/v1/seat/${id}`, params)

        return data
    } catch (error) {
        return error
    }
}

export const deleteSeat = async (id: number) => {
    try {
        const { data } = await api.delete(`/v1/seat/${id}`)

        return data
    } catch (error) {
        return error
    }
}

export const importSeats = async (file: File, options: { replaceAll?: boolean } = {}) => {
    try {
        const formData = new FormData()
        formData.append('file', file)
        
        if (options.replaceAll !== undefined) {
            formData.append('replaceAll', options.replaceAll.toString())
        }
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
        
        // Make the API request
        const { data } = await api.post('/v1/seat/import', formData, config)
        
        return data
    } catch (error: any) {
        return error
    }
}

export const validateExcelFile = (file: File | null): { isValid: boolean; message?: string } => {
    if (!file) {
        return { isValid: false, message: 'No file selected' }
    }
    
    // Check file type
    const validExtensions = ['.xls', '.xlsx']
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    
    if (!validExtensions.includes(fileExtension)) {
        return { 
            isValid: false, 
            message: `Invalid file format. Supported formats: ${validExtensions.join(', ')}`
        }
    }
    
    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    
    if (file.size > maxSize) {
        return { 
            isValid: false, 
            message: `File is too large. Maximum file size is ${formatFileSize(maxSize)}`
        }
    }
    
    return { isValid: true }
}

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}