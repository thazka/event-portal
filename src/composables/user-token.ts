import type { H3Event } from 'h3'
import { deleteCookie, getCookie, setCookie } from 'h3'
import { useCookies } from '@vueuse/integrations/useCookies'
import { useSSRContext } from 'vue'
import { type VueroSSRContext } from '../../server/types'

interface CookieOption {
  path?: string
  expires?: Date
  maxAge?: number
  domain?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: boolean | 'none' | 'lax' | 'strict'
  partitioned?: boolean
}

const tokenKey = 'token'
const options = {
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
  sameSite: 'lax',
  secure: true,
} satisfies CookieOption

export function useUserToken(event?: H3Event) {
  let token: Ref<string | undefined>

  // Server-side rendering
  if (__VUERO_SSR_BUILD__) {
    // Server side: cookies are managed by HTTP headers
    if (import.meta.env.SSR) {
      const _event = event || useSSRContext<VueroSSRContext>()?.event

      token = computed<string | undefined>({
        get() {
          if (_event) {
            return getCookie(_event, tokenKey)
          }
        },
        set(value?: string) {
          if (_event) {
            if (value) {
              setCookie(_event, tokenKey, value, options)
            }
            else {
              deleteCookie(_event, tokenKey, options)
            }
          }
        },
      })
    }
    // Client side but in SSR build
    else {
      const cookies = useCookies([tokenKey])

      token = ref(cookies.get(tokenKey))

      // Listen to cookie changes for cross-tab synchronization
      const listener = (event: any) => {
        if (event.name === tokenKey) {
          token.value = event.value
        }
      }

      cookies.addChangeListener(listener)

      // Clean up listener when component is unmounted
      if (getCurrentScope()) {
        onScopeDispose(() => cookies?.removeChangeListener(listener))
      }

      // Watch token value and update cookies accordingly
      watch(token, (value) => {
        if (value && cookies.get(tokenKey) !== value) {
          cookies.set(tokenKey, value, options)
        }
        else if (!value && cookies.get(tokenKey)) {
          cookies.remove(tokenKey, options)
        }
      })
    }
  }
  // Client-side only - use cookies instead of sessionStorage for persistence across tabs
  else {
    const cookies = useCookies([tokenKey])
    token = ref(cookies.get(tokenKey))
    
    // Listen to cookie changes for cross-tab synchronization
    const listener = (event: any) => {
      if (event.name === tokenKey) {
        token.value = event.value
      }
    }
    
    cookies.addChangeListener(listener)
    
    // Clean up listener when component is unmounted
    if (getCurrentScope()) {
      onScopeDispose(() => cookies?.removeChangeListener(listener))
    }
    
    // Watch token value and update cookies accordingly
    watch(token, (value) => {
      if (value && cookies.get(tokenKey) !== value) {
        cookies.set(tokenKey, value, options)
      }
      else if (!value && cookies.get(tokenKey)) {
        cookies.remove(tokenKey, options)
      }
    })
  }

  return token
}