import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'

import { Button } from '~/components/ui/button'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  })

  console.error(error)

  return (
    <div className="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6">
      <ErrorComponent error={error} />
      <div className="flex gap-2 items-center flex-wrap">
        <Button
          onClick={() => {
            router.invalidate()
          }}
          size="sm"
        >
          Try Again
        </Button>
        {isRoot ? (
          <Button render={<Link to="/" />} size="sm" variant="outline">
            Home
          </Button>
        ) : (
          <Button
            render={
              <Link
                to="/"
                onClick={(e) => {
                  e.preventDefault()
                  window.history.back()
                }}
              />
            }
            size="sm"
            variant="outline"
          >
            Go Back
          </Button>
        )}
      </div>
    </div>
  )
}
