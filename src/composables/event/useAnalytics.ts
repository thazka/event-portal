import { useApi } from "/@src/composables/auth/useApi";
import { useAnalytics } from "/@src/stores/event/analytics";

const api = useApi()
const { analytics, seatLayout } = useAnalytics()

export const fetchEventAnalytics = async (id: number) => {
    try {
        analytics.isLoading = true
        analytics.isError = false

        const { data } = await api.get(`/v1/dashboard?event_id=${id}`)

        if (!data.status) {
            throw new Error("Failed to fetch event analytics");
            analytics.isLoading = false
            analytics.isError = true
        }

        analytics.data = data.data
        analytics.isLoading = false
        analytics.isError = false

        return data
    } catch (error) {
        analytics.isLoading = false
        analytics.isError = true
        
        return error
    }
}

export const storeLayoutEvent = async (params: any) => {
    try {
        const { data } = await api.post('/v1/layout', params)

        return data
    } catch (error) {
        return error
    }
}

export const fetchLayoutEvent = async () => {
    try {
        seatLayout.isLoading = true
        seatLayout.isError = false

        const { data } = await api.get('/v1/layout')

        if (!data.status) {
            seatLayout.isLoading = false
            seatLayout.isError = true
            throw new Error("Failed to fetch event layout");
        }

        seatLayout.data.file = data.data.file
        seatLayout.isLoading = false
        seatLayout.isError = false

        return data
    } catch (error) {
        seatLayout.isLoading = false
        seatLayout.isError = true
        
        return error
    }
}