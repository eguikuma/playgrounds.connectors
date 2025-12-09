export type ToastOption<Properties = Record<string, unknown>> = {
  id: string
  removing?: boolean
} & Properties

export type ToasterOptions = {
  max?: number
  delay?: number
  exit?: number
}

export class Toaster<Properties = Record<string, unknown>> {
  private values: ToastOption<Properties>[] = []
  private listeners: Set<(options: ToastOption<Properties>[]) => void> = new Set()
  private counter = 0
  private readonly max: number
  private readonly delay: number
  private readonly exit: number

  constructor(options: ToasterOptions = {}) {
    this.max = options.max ?? Infinity
    this.delay = options.delay ?? 3000
    this.exit = options.exit ?? 300
  }

  subscribe(listener: (options: ToastOption<Properties>[]) => void) {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => {
      listener(this.values)
    })
  }

  add(option: Omit<ToastOption<Properties>, 'id' | 'removing'>) {
    const id = `toast-${this.counter++}`

    const toasts = [...this.values, { ...option, id } as ToastOption<Properties>]

    if (toasts.length > this.max) {
      const excess = toasts.length - this.max

      for (let i = 0; i < excess; i++) {
        toasts[i] = { ...toasts[i], removing: true } as ToastOption<Properties>
      }

      toasts.slice(0, excess).forEach((toast) => {
        setTimeout(() => this.delete(toast.id), this.exit)
      })
    }

    this.values = toasts

    this.notify()

    setTimeout(() => this.remove(id), this.delay)
  }

  remove(id: string) {
    const index = this.values.findIndex((option) => option.id === id)

    if (index === -1) return

    const toast = this.values[index]

    if (!toast) return

    if (toast.removing) return

    this.values = this.values.map((option, i) =>
      i === index ? ({ ...option, removing: true } as ToastOption<Properties>) : option,
    )

    this.notify()

    setTimeout(() => this.delete(id), this.exit)
  }

  private delete(id: string) {
    this.values = this.values.filter((option) => option.id !== id)

    this.notify()
  }

  get options() {
    return this.values
  }
}
