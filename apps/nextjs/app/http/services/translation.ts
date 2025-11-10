type Translatable = { language: { name: string }; name: string }

export const japanese = (data: Translatable[], fallback?: string) =>
  data.find(({ language }) => language.name === 'ja')?.name ?? fallback

export const hiragana = (data: Translatable[], fallback?: string) =>
  data.find(({ language }) => language.name === 'ja-Hrkt')?.name ?? fallback
