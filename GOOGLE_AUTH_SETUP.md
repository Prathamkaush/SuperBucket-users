# Google Sign-In Setup

The app uses native Google Sign-In and exchanges the Google ID token for a
Superbucket JWT at `POST /auth/google/mobile`.

## Google Cloud Console

Use one Google Cloud project for the backend and mobile applications.

1. Configure the OAuth consent screen.
2. Create a **Web application** OAuth client.
3. Put its client ID in both places:
   - Backend: `GOOGLE_WEB_CLIENT_ID`
   - App: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
4. Create an **Android** OAuth client with:
   - Package name: `com.superbuket.user`
   - SHA-1: the fingerprint of the certificate used to sign the installed app
5. Add every Android signing certificate used by the project:
   - EAS development/preview upload certificate
   - Google Play App Signing certificate for store builds

The package name and SHA-1 are a pair. A correct Web client ID alone is not
enough: if the certificate that signed the installed APK is missing, Android
opens the account chooser and then returns error code `10` (`DEVELOPER_ERROR`),
which may be displayed as "A non-recoverable sign in failure occurred."

### Get the SHA-1 for the EAS preview APK

From `user-application`, run:

```bash
npx eas-cli@latest credentials --platform android
```

Select the `preview` build profile, then view/download the Android keystore.
Copy the SHA-1 shown by EAS. If EAS does not display it, download the keystore
and run:

```bash
keytool -list -v -keystore YOUR_KEYSTORE.jks -alias YOUR_KEY_ALIAS
```

In Google Cloud Console, open **APIs & Services > Credentials**, create an
**Android** OAuth client in the same project as the Web OAuth client, and enter:

- Package name: `com.superbuket.user`
- SHA-1: the EAS certificate fingerprint (without changing it)

For an app installed from Google Play, also create an Android OAuth client for
the **App signing key certificate** SHA-1 shown under **Play Console > Setup >
App integrity**. The upload-key SHA-1 and Play app-signing SHA-1 are normally
different.

After adding the credential, wait a few minutes, uninstall the old app, create
a new preview build, and install it. Confirm that the Web client ID configured
below belongs to that same Google Cloud project.

The Android client ID identifies the native application. The Web client ID is
still required because Google issues the ID token for the backend audience.

## iOS

Create an **iOS** OAuth client using bundle ID `com.superbuket.user`.

Set `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` to that client ID. Before building iOS,
configure the Google Sign-In plugin in `app.json` with its reversed client ID:

```json
[
  "@react-native-google-signin/google-signin",
  {
    "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"
  }
]
```

## Local Environment

Create `user-application/.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:3030
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
```

For a physical phone, `localhost` points to the phone, not the development
computer. Use the computer's LAN IP and allow port `3030` through the firewall.

Set the matching backend value:

```env
GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` are used
by the existing browser OAuth flow. The native app endpoint only requires
`GOOGLE_WEB_CLIENT_ID`.

## Build and Test

Native Google Sign-In does not work in Expo Go. Create a new EAS development or
preview build after changing OAuth clients or native plugin configuration.

```bash
npx eas-cli@latest build --platform android --profile preview
```

Install that build, start the backend on `0.0.0.0:3030`, and press **Continue
with Google**.
