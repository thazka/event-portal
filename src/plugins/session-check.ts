import { definePlugin } from '/@src/utils/plugins'

export default definePlugin(async ({ router, pinia, event }) => {
  const userSession = useUserSession(pinia)
  const token = useUserToken(event)
  const auth = useAuth()

  // 1. Load user profile if token is present.
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

  // 2. If the page requires auth, check if user is logged in
  // if not, redirect to login page.
  router.beforeEach((to, from, next) => {
    const token = useUserToken(event)
    if (to.meta.requiresAuth && !token.value) {
      next({
        name: '/auth',
        // save the location we were at to come back later
        query: { redirect: to.fullPath },
      })
    } else {
      next()
    }
  })
})
