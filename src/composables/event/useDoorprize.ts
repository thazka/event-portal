import { useApi } from "/@src/composables/auth/useApi";
import { useDoorprize } from "/@src/stores/event/doorprize";

const api = useApi()
const { doorprize } = useDoorprize()

export const fetchDoorprize = async (params: any) => {
    try {
        doorprize.data = []
        doorprize.isLoading = true
        doorprize.isError = false

        const { data } = await api.get(`/v1/doorprize`, { params })

        if(!data.status) {
            doorprize.data = []
            doorprize.isLoading = false
            doorprize.isError = true
                
            throw new Error("Failed to fetch doorprize");
        }

        doorprize.data = data.data
        doorprize.isError = false
        doorprize.isLoading = false

        return data
    } catch (error) {
        doorprize.data = []
        doorprize.isLoading = false
        doorprize.isError = true

        return error
    }
}

export const storeDoorprize = async (params: any) => {
    try {
        const { data } = await api.post('/v1/doorprize', params)

        return data
    } catch (error) {
        return error
    }
}

export const deleteDoorprize = async (id: number) => {
    try {
        const { data } = await api.delete(`/v1/doorprize/${id}`)
        
        return data
    } catch (error) {
        return error
    }
}

export const updateWinner = async (id: number, params: any) => {
    try {
        const { data } = await api.put(`/v1/doorprize/${id}/winner`, params)
        
        if (!data.status) {
            throw new Error("Failed update winner");
        }
        
        return data
    } catch (error) {
        return error   
    }
}