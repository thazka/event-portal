import axios, { type AxiosInstance, AxiosHeaders } from 'axios'

let api: AxiosInstance | undefined

function createApi(): AxiosInstance {
    const instance = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
    })

    instance.interceptors.request.use((config) => {
        const token = useUserToken()
        const userSession = useUserSession()

        if (token.value) {
            if (config.headers instanceof AxiosHeaders) {
                config.headers.set('Authorization', `Bearer ${token.value}`)
            } else {
                const headersObj =
                    config.headers && typeof config.headers === 'object' ? config.headers : {}
                config.headers = new AxiosHeaders({ ...headersObj, Authorization: `Bearer ${token.value}` })
            }
        }

        return config
    })

    return instance
}

export function useApi(): AxiosInstance {
    if (!api) {
        api = createApi()
    }
    return api
}
