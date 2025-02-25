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
        seatList.isLoading = false
        seatList.isError = false
        
    } catch (error) {
        seatList.data = []
        seatList.isLoading = false
        seatList.isError = true

        return error
    }
}  