import { AppTheme } from '../types'

export const darkTheme: AppTheme = {
  id: 'dark',
  bg: {
    primary:  '#0D0D0F',
    surface:  '#16161A',
    elevated: '#1E1E25',
    overlay:  'rgba(0,0,0,0.75)',
    glass:    'rgba(255,255,255,0.05)',
  },
  accent: {
    primary:   '#E8FF47',
    secondary: '#FF4757',
    tertiary:  '#7B61FF',
    warm:      '#FF9F43',
    premium:   '#FFD700',
  },
  text: {
    primary:   '#F8F8FF',
    secondary: '#8888AA',
    muted:     '#44445A',
    inverse:   '#0D0D0F',
    onPrimary: '#0D0D0F',
  },
  border: {
    subtle:  'rgba(255,255,255,0.05)',
    default: 'rgba(255,255,255,0.10)',
    strong:  'rgba(255,255,255,0.20)',
    focus:   '#E8FF47',
  },
  glow: {
    primary: 'rgba(232,255,71,0.20)',
    danger:  'rgba(255,71,87,0.25)',
    success: 'rgba(46,213,115,0.20)',
  },
  game: {
    imposterBg:    '#2D0A0A',
    crewBg:        '#0C1A40',
    voteBg:        '#0A0A0D',
    cardText:      '#FFFFFF',
    cardTextMuted: 'rgba(255,255,255,0.55)',
  },
  status: {
    success: '#2ED573',
    warning: '#FF9F43',
    error:   '#FF4757',
    info:    '#7B61FF',
  },
}
