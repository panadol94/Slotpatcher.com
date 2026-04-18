# SQUEEN668 RTP Scanner Mobile Wrapper

Wrapper app untuk Android dan iOS menggunakan Capacitor.

## Apa yang sudah siap
- Android project di `mobile-app/android`
- iOS project di `mobile-app/ios`
- Config app dalam `mobile-app/capacitor.config.js`
- App ini memuatkan live site:
  - `https://o13mvk11vxe2u4kklhboj6vd.158.220.127.34.sslip.io`

## Command asas
```bash
cd mobile-app
npm install
npx cap sync
npx cap open android
npx cap open ios
```

## Untuk keluarkan APK Android
Mesin build perlukan sekurang-kurangnya:
- JDK penuh (bukan setakat runtime)
- Android SDK
- Android Build Tools

Selepas toolchain siap:
```bash
cd mobile-app/android
./gradlew assembleDebug
```

## Nota iOS
Untuk build/run iOS, tetap perlukan macOS + Xcode.
