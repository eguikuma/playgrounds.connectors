import type { MonitorRequested, MonitorResponded } from '@outcomify/requestify'

export type Responded = {
  id: string
  message: string
  timestamp: string
}

export type Snapshot = {
  request: {
    before: MonitorRequested | null
    after: MonitorRequested | null
  }
  response: MonitorResponded | null
  on: {
    timelines: {
      kind: string
      timestamp: Date
    }[]
  }
}
