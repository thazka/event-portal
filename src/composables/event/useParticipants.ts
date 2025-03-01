import moment from 'moment'
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

export const updateParticipant = async (id: number, params: any) => {
    try {
        const { data } = await api.put(`/v1/participant/${id}`, params)
        return data
    } catch (error) {
        return error
    }
}

export const updateSeatParticipant = async (event_id: number, participant_id: number, seat_id: number) => {
    try {
        const { data } = await api.put(`/v1/participant/seat`, {
            event_id,
            participant_id,
            seat_id
        })

        return data
    } catch (error) {
        return error
    }
}

export const updateAttendance = async (event_id: number, participant_id: number, dateAttendance: string) => {
    try {
        const { data } = await api.put(`/v1/participant/attendance`, {
            event_id,
            participant_id,
            date: dateAttendance
        })

        return data
    } catch (error) {
        return error
    }
}

export const downloadParticipant = async () => {
    try {
        const { data } = await api.get(`/v1/participant/export`, {
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            responseType: 'blob'
        })

        // Membuat URL dan memicu download
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'participants.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return data
    } catch (error) {
        return error
    }
}

export const importParticipant = async (params: any) => {
    try {
        const { data } = await api.post(`/v1/participant/import`, params)

        return data
    } catch (error) {
        return error
    }
}