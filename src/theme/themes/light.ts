import { AppTheme } from '../types'

export const lightTheme: AppTheme = {
  id: 'light',
  bg: {
    primary:  '#F0F0F5',
    surface:  '#FFFFFF',
    elevated: '#FFFFFF',
    overlay:  'rgba(0,0,0,0.45)',
    glass:    'rgba(255,255,255,0.80)',
  },
  accent: {
    primary:   '#1A1A2E',
    secondary: '#E63946',
    tertiary:  '#6C63FF',
    warm:      '#F4813A',
    premium:   '#C9A227',
  },
  text: {
    primary:   '#1A1A2E',
    secondary: '#5A5A7A',
    muted:     '#A0A0C0',
    inverse:   '#FFFFFF',
    onPrimary: '#FFFFFF',
  },
  border: {
    subtle:  'rgba(0,0,0,0.05)',
    default: 'rgba(0,0,0,0.10)',
    strong:  'rgba(0,0,0,0.20)',
    focus:   '#1A1A2E',
  },
  glow: {
    primary: 'rgba(26,26,46,0.12)',
    danger:  'rgba(230,57,70,0.15)',
    success: 'rgba(42,157,143,0.15)',
  },
  game: {
    imposterBg:    '#FFE4E4',
    crewBg:        '#E4E8FF',
    voteBg:        '#F5F5FA',
    cardText:      '#1A1A2E',
    cardTextMuted: 'rgba(26,26,46,0.55)',
  },
  status: {
    success: '#2A9D8F',
    warning: '#F4813A',
    error:   '#E63946',
    info:    '#6C63FF',
  },
}
