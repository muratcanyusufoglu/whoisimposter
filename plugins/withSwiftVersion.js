const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

/**
 * Config plugin that fixes Swift 6 strict concurrency build errors in CocoaPods.
 *
 * expo-modules-core declares swift_version '6.0' and uses @MainActor in protocol
 * conformance lists — a Swift 6-only feature. Downgrading SWIFT_VERSION to 5.x
 * breaks that syntax with "unknown attribute 'MainActor'".
 *
 * The correct fix: keep Swift 6 language mode, set SWIFT_STRICT_CONCURRENCY to
 * 'minimal' which suppresses strict concurrency enforcement without changing the
 * language version. This patch runs AFTER react_native_post_install() so it wins.
 */
function withSwiftVersion(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile',
      )
      let contents = fs.readFileSync(podfilePath, 'utf8')

      const concurrencyPatch = [
        '',
        '    # expo-modules-core requires Swift 6 (@MainActor in conformance lists).',
        '    # Disable strict concurrency enforcement to suppress Swift 6 build errors.',
        '    installer.pods_project.targets.each do |target|',
        '      target.build_configurations.each do |cfg|',
        "        cfg.build_settings['SWIFT_STRICT_CONCURRENCY'] = 'minimal'",
        "        cfg.build_settings.delete('SWIFT_VERSION')",
        '      end',
        '    end',
        '',
      ].join('\n')

      const anchor = '    )\n  end\nend\n'

      if (contents.includes(anchor)) {
        // Remove any existing version of this patch (idempotent)
        contents = contents.replace(
          /\n    # (?:Force Swift|expo-modules-core).*?end\n\n(    \)\n)/s,
          '\n$1',
        )
        // Inject AFTER the closing ) of react_native_post_install
        contents = contents.replace(anchor, '    )' + concurrencyPatch + '  end\nend\n')
        fs.writeFileSync(podfilePath, contents)
      }

      return config
    },
  ])
}

module.exports = withSwiftVersion
