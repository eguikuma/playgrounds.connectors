export class UrlTooLongError extends Error {
  static readonly MaxLength = 2083

  constructor() {
    super('URL exceeds maximum length of 2083 characters')
    this.name = 'UrlTooLongError'
  }
}

export class InvalidUrlError extends Error {
  constructor() {
    super('URL syntax is invalid')
    this.name = 'InvalidUrlError'
  }
}

export class UnresolvedSourceError extends Error {
  constructor() {
    super('Source could not be resolved')
    this.name = 'UnresolvedSourceError'
  }
}

export class VerifyError extends Error {
  constructor() {
    super('Response does not match expected schema')
    this.name = 'VerifyError'
  }
}

export class UnsafeUrlError extends Error {
  constructor() {
    super('URL is not safe for external requests')
    this.name = 'UnsafeUrlError'
  }
}

export class InvalidMetadataError extends Error {
  constructor() {
    super('Request metadata contains non-ISO-8859-1 characters')
    this.name = 'InvalidMetadataError'
  }
}
