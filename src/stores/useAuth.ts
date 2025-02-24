import { defineStore } from 'pinia'
import { useApiAuth } from '/@src/composables/auth/useApiAuth'
import { useApi } from '/@src/composables/auth/useApi'

export const useAuth = defineStore('auth', () => {
  const api = useApiAuth()
  const userSession = useUserSession()
  const apiMe = useApi()
  const token = useUserToken()

  const login = async (payload: object) => {
    try {
      const { data } = await api.post('/login', payload)

      if (!data.status) {
        throw new Error('Gagal login')
      } else {
        token.value = data.token
        userSession.setUser(data.data)
      }

      return data
    } catch (error: any) {
      throw new Error('Gagal login')
    }
  }

  const logout = async () => {
    try {
      await userSession.logoutUser()
    } catch (error) {
      throw new Error('Gagal logout')
    }
  }

  const fetchMe = async () => {
    try {
      const { data } = await apiMe.get('/v1/me')

      let tempData = data

      userSession.setUser(tempData)
      return data
    } catch (err) {
      userSession.logoutUser()
    }
  }

  return {
    login,
    logout,
    fetchMe,
  }
})
