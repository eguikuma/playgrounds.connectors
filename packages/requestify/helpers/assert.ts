import { InvalidMetadataError, UnsafeUrlError } from './exception'

const CharacterCodeLimits = {
  MaxByte: 255,
  FirstPrintable: 32,
  Delete: 127,
} as const

const PrivateIpv4Options = {
  ClassA: { First: 10 },
  ClassB: { First: 172, SecondMin: 16, SecondMax: 31 },
  ClassC: { First: 192, Second: 168 },
  Loopback: { First: 127 },
  LinkLocal: { First: 169, Second: 254 },
  ZeroAddress: { First: 0 },
} as const

const PrivateIpv6Options = {
  Loopback: { Full: '[::1]', Zero: '[::]' },
  LinkLocal: { Prefix: '[fe80:', ZeroPrefix: '[fe80::' },
  UniqueLocalFC: { Prefix: '[fc00:', ZeroPrefix: '[fc00::' },
  UniqueLocalFD: { Prefix: '[fd00:', ZeroPrefix: '[fd00::' },
} as const

export const assertHeaders = (headers: Headers): void => {
  headers.forEach((value) => {
    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i)

      if (
        code > CharacterCodeLimits.MaxByte ||
        code < CharacterCodeLimits.FirstPrintable ||
        code === CharacterCodeLimits.Delete
      ) {
        throw new InvalidMetadataError()
      }
    }
  })
}

export const assertUrl = (value: string, unsafe?: boolean, localhost?: boolean): void => {
  const matched = value.match(/^https?:\/\/([^/:?#]+)/)
  const raw = matched ? matched[1] : null

  if (raw) {
    const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/

    if (ipv4.test(raw)) {
      const octets = raw.split('.')

      if (octets.some((octet) => octet.length > 1 && octet.startsWith('0'))) {
        throw new UnsafeUrlError()
      }

      const parts = octets.map(Number)

      if (parts.some((part) => part < 0 || part > 255)) {
        throw new UnsafeUrlError()
      }
    }
  }

  const parsed = new URL(value)

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new UnsafeUrlError()
  }

  if (unsafe) {
    return
  }

  const hostname = parsed.hostname.toLowerCase()

  if (hostname === 'localhost' && !localhost) {
    throw new UnsafeUrlError()
  }

  if (hostname.includes(':')) {
    if (
      hostname === PrivateIpv6Options.Loopback.Full ||
      hostname === PrivateIpv6Options.Loopback.Zero
    ) {
      if (!localhost) {
        throw new UnsafeUrlError()
      }

      return
    }

    if (
      hostname.startsWith(PrivateIpv6Options.LinkLocal.Prefix) ||
      hostname.startsWith(PrivateIpv6Options.LinkLocal.ZeroPrefix)
    ) {
      throw new UnsafeUrlError()
    }

    if (
      hostname.startsWith(PrivateIpv6Options.UniqueLocalFC.Prefix) ||
      hostname.startsWith(PrivateIpv6Options.UniqueLocalFC.ZeroPrefix)
    ) {
      throw new UnsafeUrlError()
    }

    if (
      hostname.startsWith(PrivateIpv6Options.UniqueLocalFD.Prefix) ||
      hostname.startsWith(PrivateIpv6Options.UniqueLocalFD.ZeroPrefix)
    ) {
      throw new UnsafeUrlError()
    }

    return
  }

  const pattern = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!pattern.test(hostname)) {
    return
  }

  const [first, second] = hostname.split('.').map(Number)

  if (first === PrivateIpv4Options.ClassA.First) {
    throw new UnsafeUrlError()
  }

  if (
    first === PrivateIpv4Options.ClassB.First &&
    second !== undefined &&
    second >= PrivateIpv4Options.ClassB.SecondMin &&
    second <= PrivateIpv4Options.ClassB.SecondMax
  ) {
    throw new UnsafeUrlError()
  }

  if (first === PrivateIpv4Options.ClassC.First && second === PrivateIpv4Options.ClassC.Second) {
    throw new UnsafeUrlError()
  }

  if (first === PrivateIpv4Options.Loopback.First && !localhost) {
    throw new UnsafeUrlError()
  }

  if (
    first === PrivateIpv4Options.LinkLocal.First &&
    second === PrivateIpv4Options.LinkLocal.Second
  ) {
    throw new UnsafeUrlError()
  }

  if (first === PrivateIpv4Options.ZeroAddress.First) {
    throw new UnsafeUrlError()
  }
}
