import { definePlugin } from '/@src/utils/plugins'
import { useAuth } from '/@src/stores/useAuth'

export default definePlugin(async ({ router, pinia }) => {
  const auth = useAuth()
  const userSession = useUserSession(pinia)
  const token = useUserToken()

  // When using SSR, it should be hydrated from the server
  if (token.value && !userSession.user) {
    try {
      const user = await auth.fetchMe()
      userSession.setUser(user.data)
    }
    catch (err) {
      token.value = undefined
    }
  }

  router.beforeEach((to) => {
    const token = useUserToken()
    if (to.meta.requiresAuth && !token.value) {
      return {
        name: '/auth',
        query: { redirect: to.fullPath },
      }
    }
  })
})
