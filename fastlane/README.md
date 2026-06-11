fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios upload_metadata

```sh
[bundle exec] fastlane ios upload_metadata
```

Upload ASO metadata to App Store Connect (no binary, no screenshots)

### ios upload_screenshots_missing

```sh
[bundle exec] fastlane ios upload_screenshots_missing
```

Re-upload only the previously-failed screenshots (append, no delete)

### ios upload_screenshots

```sh
[bundle exec] fastlane ios upload_screenshots
```

Upload localized App Store screenshots (no binary, no metadata)

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
