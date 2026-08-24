type HealthResponse = {
  id: number
  title: string
  completed: boolean
}

const DEFAULT_HEALTH_CHECK_URL = 'https://jsonplaceholder.typicode.com/todos/1'

function isHealthResponse(value: unknown): value is HealthResponse {
  if (!value || typeof value !== 'object') {
    return false
  }

  const response = value as Record<string, unknown>
  return (
    typeof response.id === 'number' &&
    typeof response.title === 'string' &&
    typeof response.completed === 'boolean'
  )
}

async function getHealthResponse(): Promise<HealthResponse | null> {
  const endpoint = process.env.HEALTH_CHECK_URL ?? DEFAULT_HEALTH_CHECK_URL

  try {
    const response = await fetch(endpoint, { next: { revalidate: 60 } })
    if (!response.ok) {
      return null
    }

    const data: unknown = await response.json()
    return isHealthResponse(data) ? data : null
  } catch {
    return null
  }
}

export default async function HealthPage() {
  const healthResponse = await getHealthResponse()
  const isHealthy = healthResponse !== null

  return (
    <section aria-labelledby="health-title" className="mx-auto max-w-3xl space-y-8 py-12">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">System status</p>
        <h1 id="health-title" className="text-4xl tracking-tight text-primary sm:text-5xl">BookVault Health</h1>
        <p className="max-w-2xl text-lg leading-8 text-muted">A server-rendered check of the BookVault service connection.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-card border border-border bg-card p-5">
          <p className="text-sm text-muted">Overall status</p>
          <p className={`mt-2 text-2xl font-semibold ${isHealthy ? 'text-primary' : 'text-accent-foreground'}`}>
            {isHealthy ? 'Healthy' : 'Unhealthy'}
          </p>
        </div>
        <div className="rounded-card border border-border bg-card p-5">
          <p className="text-sm text-muted">HTTP / data fetch</p>
          <p className="mt-2 text-2xl font-semibold text-primary">{isHealthy ? '200 OK' : 'Unavailable'}</p>
        </div>
      </div>

      <section aria-labelledby="response-title" className="rounded-card border border-border bg-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Fetched response</p>
        <h2 id="response-title" className="mt-3 text-2xl text-primary">Public endpoint sample</h2>
        {healthResponse ? (
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-8">
            <dt className="font-semibold text-primary">Todo ID</dt>
            <dd>{healthResponse.id}</dd>
            <dt className="font-semibold text-primary">Title</dt>
            <dd className="break-words">{healthResponse.title}</dd>
            <dt className="font-semibold text-primary">Completed</dt>
            <dd>{healthResponse.completed ? 'Yes' : 'No'}</dd>
          </dl>
        ) : (
          <p role="status" className="mt-6 leading-7 text-muted">Unable to fetch health data right now. Please try again later.</p>
        )}
      </section>
    </section>
  )
}
