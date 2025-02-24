import { useApi } from '/@src/composables/auth/useApi'
import { useParticipants } from '/@src/stores/event/participants'

const api = useApi()
const { participants } = useParticipants()

export const fetchEventParticipants = async (params: any) => {
    try {
        participants.isLoading = true
        participants.isError = false
        participants.data = []
        
        const { data } = await api.get('/v1/participant', { params })


        if (!data.status) {
            participants.isLoading = false
            participants.isError = true
            participants.data = []
            
            throw new Error("Failed to fetch participants");
        }

        participants.isLoading = false
        participants.isError = false
        participants.data = data.data
        participants.pagination = data.pagination
        
        return data
    } catch (error) {
        participants.isLoading = false
        participants.isError = true
        participants.data = []

        return error
    }
}