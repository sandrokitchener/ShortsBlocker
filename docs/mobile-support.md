# Mobile Support Notes

Status checked on March 31, 2026.

## Reality Check

- A desktop browser extension will not change the native YouTube, Instagram, Facebook, or LinkedIn mobile apps.
- If the real problem is inside those native apps, we likely need a different product shape such as an accessibility-based blocker, a device-level app blocker, or a browser-first workflow.

## Browser Paths

### Android

- Chrome on Android is not a practical path for this project. Google's Chrome Help says extensions are for desktop, and on phone the flow is only `Add to Desktop`, meaning the extension gets installed for desktop Chrome later rather than running on the phone browser itself.
- Firefox for Android is the clearest browser-extension path. Mozilla's official help says Firefox for Android can install extensions from `addons.mozilla.org/android` or from the in-browser Extensions manager.

### iPhone and iPad

- Safari is the real path on iOS and iPadOS.
- Apple says Safari extensions can work on iPhone, iPad, and Mac.
- Apple also says web extensions from other browsers can be converted for Safari, and as of the current docs they can even be packaged for testing without a Mac or Xcode by uploading a ZIP to App Store Connect.

## Suggested Product Strategy

1. Keep the current WXT codebase as the Chromium and desktop base.
2. Add a Firefox target next and test Android browser usage there first.
3. After the Firefox path is stable, investigate Safari packaging for iPhone and iPad.
4. Treat native mobile apps as a separate problem, because a browser extension will not modify those feeds.

## Sources

- Google Chrome Help: https://support.google.com/chrome/answer/2664769
- Firefox for Android Help: https://support.mozilla.org/en-US/kb/find-and-install-add-ons-firefox-android
- Apple Safari extensions: https://developer.apple.com/safari/extensions/
