# Phone widgets

## Android

The companion provides native Clock, Focus timer, Calculator and Tic Tac Toe home-screen widgets. Each widget has its own local state and appearance preferences. Press and hold a home-screen widget to resize it, or tap its menu to change the theme, background transparency, text size and clock or timer options. The launcher determines the available grid sizes. The focus timer uses a wall-clock deadline with Android's countdown chronometer and an inexact completion alarm. It resumes its stored deadline after process recreation. Screen time or native focus sessions are separate from website analytics and cloud tool history.

The app opens the website through the system browser, which supports the website's existing Google sign-in. It does not embed the Google flow in a WebView. Native widgets work without a network connection.

Build with JDK 17 or 21, Android SDK 35, Gradle 8.11.1 and Android Gradle Plugin 8.9.1. Set ANDROID_HOME to the SDK and ARPIT_WIDGET_KEYSTORE / ARPIT_WIDGET_KEY_PASSWORD to a private signing key with alias arpit-widgets. Run gradle :app:assembleRelease from mobile/android, then copy app/build/outputs/apk/release/app-release.apk to public/downloads/Arpit-Agarwala.apk. Retain the signing key privately to sign later updates.

## iPhone

The SwiftUI app and WidgetKit extension require iOS 17 or later. The four interactive widgets use the native app group's device-local storage. They do not authenticate to the website or change cloud tool history.

On a Mac with Xcode and XcodeGen installed, run xcodegen generate from the folder containing project.yml (mobile/apple in this repository) and open ArpitWidgets.xcodeproj. Choose your Apple signing team on both targets. Register the shared App Group group.com.arpitagarwala.widgets and enable it for the app and extension. Build and test on an iPhone, then distribute with Apple's signing workflow. The Apple source has not been compiled or device-tested on the Windows workstation.

The web app can be installed directly from Safari through Share → Add to Home Screen and provides compact tools at /widgets.
