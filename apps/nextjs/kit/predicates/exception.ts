export const isNative = (thrown: unknown): thrown is Error => thrown instanceof Error
