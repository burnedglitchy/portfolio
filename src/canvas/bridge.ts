export type ThemeName = 'light' | 'dark'

type ThemeTokens = {
  background: string
  foreground: string
}

export const sceneBridge = {
  heroProgress: { current: 0 },
  theme: { current: 'light' as ThemeName },
  themeTokens: { current: { background: '', foreground: '' } as ThemeTokens },
}

export function syncThemeBridge(theme: ThemeName) {
  document.documentElement.dataset.theme = theme

  const styles = getComputedStyle(document.documentElement)

  sceneBridge.theme.current = theme
  sceneBridge.themeTokens.current = {
    background: styles.getPropertyValue('--bg').trim(),
    foreground: styles.getPropertyValue('--fg').trim(),
  }
}
