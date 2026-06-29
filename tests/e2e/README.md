# Mobile UX Testing

This project uses Playwright for fast Expo Web mobile checks and Maestro flow files for real native simulator/device smoke tests.

Run the local mobile-web checks:

```sh
npm run test:e2e:web
```

Run native Maestro flows after installing the Maestro CLI and launching an iOS simulator or Android emulator:

```sh
npm run test:e2e:maestro
```

Playwright is useful for layout, copy, touch-target, and redirect checks. Maestro is the better fit for final human-like native flows such as keyboard behavior, biometric prompts, camera permission, QR scanning, push notifications, and platform gestures.
