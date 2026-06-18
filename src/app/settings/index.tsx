import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';

export default function SettingsScreen() {
  return (
    <Screen title="Settings" subtitle="Device security, biometrics, and deep-link settings will live here.">
      <StateMessage
        title="Planned for the next pass"
        message="Phase 2 can add biometric unlock, push notification preferences, and payment return-link diagnostics."
      />
    </Screen>
  );
}
