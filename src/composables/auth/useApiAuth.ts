import axios, { type AxiosInstance } from 'axios'
let apiAuth: AxiosInstance

export function createApi() {
    apiAuth = axios.create({
        baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
        headers: {
            'Content-Type': 'application/json',
        },
    })

    return apiAuth
}

export function useApiAuth() {
    if (!apiAuth) {
        createApi()
    }
    return apiAuth
}
