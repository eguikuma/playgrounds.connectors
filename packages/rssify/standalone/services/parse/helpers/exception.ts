export class ParseError extends Error {
  constructor(cause?: unknown) {
    super('RSS parse is failed', cause !== undefined ? { cause } : undefined)
    this.name = 'ParseError'
  }
}
