export interface EventStats {
    total_participants: number;
    total_seat_assigned: number;
    total_presents: number;
    total_not_yet_presents: number;
    attendance_rate: number;
}


export interface Event {
    id: number
    participant_id: number
    event_id: number
    seat_id: number | null
    attendance: string | null
    created_at: string
    updated_at: string
}

export interface Seat {
    id: number
    name: string
    created_at?: string
    updated_at?: string
    deleted_at?: string | null
    created_by?: number
}

export interface Participant {
    id: number
    name: string
    company: string
    phone: string
    created_at: string
    updated_at: string
    deleted_at: string | null
    created_by: number
    seat_status: number
    event: Event
}

export interface Props {
    data: Participant[]
    filter: {
        search: string
        page: number
        offset: number
        event_id: number
    }
    loading: boolean
    sortColumn: keyof Participant | 'seat' | 'attendance' | null
    sortDirection: 'asc' | 'desc' | null
    seatList: Seat[]
}