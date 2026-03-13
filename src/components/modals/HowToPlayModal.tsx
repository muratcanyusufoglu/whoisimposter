import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/theme'
import { spacing, radius, fontSize, fontFamily } from '@/theme/tokens'
import { GameModeDefinition } from '@/types'
import { GameImage } from '@/components/game/GameImage'
import { Modal } from '@/components/ui/Modal'

// ─────────────────────────────────────────────────────────────────────────────
// HOW TO PLAY MODAL
// Bottom sheet showing game instructions: intro + 3 steps.
// Opened from the setup screen's ? button in the header.
// ─────────────────────────────────────────────────────────────────────────────

interface HowToPlayModalProps {
  visible: boolean
  onClose: () => void
  mode: GameModeDefinition
}

export function HowToPlayModal({ visible, onClose, mode }: HowToPlayModalProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()

  // Derive the i18n key prefix from descriptionKey: 'games.imposter.description' → 'games.imposter'
  const keyPrefix = mode.descriptionKey.replace('.description', '')

  const steps = [
    {
      num: '1',
      title: t(`${keyPrefix}.howToPlay.step1_title`),
      desc: t(`${keyPrefix}.howToPlay.step1_desc`),
    },
    {
      num: '2',
      title: t(`${keyPrefix}.howToPlay.step2_title`),
      desc: t(`${keyPrefix}.howToPlay.step2_desc`),
    },
    {
      num: '3',
      title: t(`${keyPrefix}.howToPlay.step3_title`),
      desc: t(`${keyPrefix}.howToPlay.step3_desc`),
    },
  ]

  return (
    <Modal visible={visible} position="bottom" onClose={onClose}>
      {/* Handle bar */}
      <View style={styles.handleWrap}>
        <View style={[styles.handle, { backgroundColor: theme.border.strong }]} />
      </View>

      {/* Game name row */}
      <View style={styles.titleRow}>
        <GameImage id={mode.id} size={32} />
        <Text
          style={[styles.title, { color: theme.text.primary, fontFamily: fontFamily.displayBold }]}
          numberOfLines={1}
        >
          {t(mode.nameKey)}
        </Text>
      </View>

      {/* Intro */}
      <Text style={[styles.intro, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
        {t(`${keyPrefix}.howToPlay.intro`)}
      </Text>

      {/* Steps */}
      <ScrollView
        style={styles.stepsScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.stepsContent}
      >
        {steps.map((step) => (
          <View key={step.num} style={styles.stepRow}>
            <View style={[styles.stepBadge, { backgroundColor: theme.accent.primary }]}>
              <Text style={[styles.stepNum, { color: theme.text.onPrimary, fontFamily: fontFamily.displayBold }]}>
                {step.num}
              </Text>
            </View>
            <View style={styles.stepText}>
              <Text style={[styles.stepTitle, { color: theme.text.primary, fontFamily: fontFamily.bodyBold }]}>
                {step.title}
              </Text>
              <Text style={[styles.stepDesc, { color: theme.text.secondary, fontFamily: fontFamily.body }]}>
                {step.desc}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* CTA */}
      <TouchableOpacity
        onPress={onClose}
        style={[styles.closeBtn, { backgroundColor: theme.accent.primary }]}
        accessibilityRole="button"
      >
        <Text style={[styles.closeBtnText, { color: theme.text.onPrimary, fontFamily: fontFamily.displayBold }]}>
          {t('howToPlay.close')}
        </Text>
      </TouchableOpacity>
    </Modal>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  handleWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize['2xl'],
    letterSpacing: -0.5,
    flex: 1,
  },
  intro: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.55,
    marginBottom: spacing.xl,
  },
  stepsScroll: {
    maxHeight: 280,
  },
  stepsContent: {
    gap: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNum: {
    fontSize: fontSize.sm,
  },
  stepText: {
    flex: 1,
    gap: 3,
  },
  stepTitle: {
    fontSize: fontSize.md,
  },
  stepDesc: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.55,
  },
  closeBtn: {
    marginTop: spacing.xl,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: fontSize.md,
    letterSpacing: -0.2,
  },
})
