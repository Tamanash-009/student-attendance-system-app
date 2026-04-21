/// <reference types="vite-plugin-pwa/client" />
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from './ui/Button'

export function PWABadge() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setNeedRefresh(false)
  }

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-card border border-border shadow-lg rounded-xl p-4 max-w-sm">
        <h3 className="font-semibold text-lg mb-1">Update Available!</h3>
        <p className="text-sm text-muted-foreground mb-4">
          A new version of Attendify is ready. Reload to apply.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => close()}>
            Dismiss
          </Button>
          <Button size="sm" onClick={() => updateServiceWorker(true)}>
            Reload App
          </Button>
        </div>
      </div>
    </div>
  )
}
