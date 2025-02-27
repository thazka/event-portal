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