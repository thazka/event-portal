import { useApi } from '/@src/composables/auth/useApi'

const api = useApi()

export const fetchLayoutParticipant = async (phone: string) => {
    try {
        const { data } = await api.get(`/v1/check-place?phone=${phone}`)
        return data
    } catch (error) {
        return error
    }
}