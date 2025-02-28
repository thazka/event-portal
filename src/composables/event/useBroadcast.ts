import { useApi } from "/@src/composables/auth/useApi"
import { useBroadcast } from "/@src/stores/event/broadcast"

const api = useApi()
const { broadcastList } = useBroadcast()

export const fetchBroadcasts = async (params: any) => {
    try {
        broadcastList.isLoading = true
        broadcastList.isError = false
        broadcastList.data = []

        const { data } = await api.get('/v1/broadcast', { params })

        if (!data.status) {
            broadcastList.data = []
            broadcastList.isError = true
            broadcastList.isLoading = false

            throw new Error("Failed to fetch broadcasts");
        }

        broadcastList.data = data.data
        broadcastList.isLoading = false
        broadcastList.isError = false
    } catch (error) {
        broadcastList.data = []
        broadcastList.isError = true
        broadcastList.isLoading = false
        
        return error
    }
}

export const storeBroadcast = async (params: any) => {
    try {
        const { data } = await api.post(`/v1/broadcast`, params)

        return data
    } catch (error) {
        return error
    }
}