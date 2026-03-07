import { AppTheme } from '../types'

export const neonTheme: AppTheme = {
  id: 'neon',
  bg: {
    primary:  '#070715',
    surface:  '#0D0D2B',
    elevated: '#121238',
    overlay:  'rgba(0,0,0,0.80)',
    glass:    'rgba(0,255,255,0.04)',
  },
  accent: {
    primary:   '#00FFFF',
    secondary: '#FF00FF',
    tertiary:  '#00FF88',
    warm:      '#FFCC00',
    premium:   '#AA44FF',
  },
  text: {
    primary:   '#E0F7FF',
    secondary: '#6090A0',
    muted:     '#304050',
    inverse:   '#070715',
    onPrimary: '#070715',
  },
  border: {
    subtle:  'rgba(0,255,255,0.07)',
    default: 'rgba(0,255,255,0.15)',
    strong:  'rgba(0,255,255,0.30)',
    focus:   '#00FFFF',
  },
  glow: {
    primary: 'rgba(0,255,255,0.25)',
    danger:  'rgba(255,0,255,0.25)',
    success: 'rgba(0,255,136,0.20)',
  },
  game: {
    imposterBg:    '#220822',
    crewBg:        '#071830',
    voteBg:        '#080818',
    cardText:      '#E0F7FF',
    cardTextMuted: 'rgba(224,247,255,0.55)',
  },
  status: {
    success: '#00FF88',
    warning: '#FFCC00',
    error:   '#FF00FF',
    info:    '#00FFFF',
  },
}
