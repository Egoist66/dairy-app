import type { Ref } from 'vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    $t: (key: string) => string
    $locale: Ref<string>
    $toggleLocale: () => void
  }
}
