import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { getDeviceSecurityStatus } from '@/services/security';

const authTypeLabels: Record<number, string> = {
  [LocalAuthentication.AuthenticationType.FINGERPRINT]: 'Fingerprint',
  [LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION]: 'Face recognition',
  [LocalAuthentication.AuthenticationType.IRIS]: 'Iris',
};

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getDeviceSecurityStatus>> | null>(null);

  async function loadStatus() {
    setLoading(true);
    try {
      setStatus(await getDeviceSecurityStatus());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  const supportedTypes = status?.supportedTypes.map((type) => authTypeLabels[type] ?? 'Device security').join(', ');

  return (
    <Screen title="Security settings" subtitle="Review the device protections BotsaPay uses before sensitive payments.">
      {loading && <ActivityIndicator />}
      {status && (
        <Card>
          <ThemedText type="smallBold">Local payment confirmation</ThemedText>
          <ThemedText themeColor="textSecondary">
            {status.hasHardware
              ? 'This device supports local authentication.'
              : 'This device does not report biometric or local-auth hardware.'}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            {status.isEnrolled
              ? `Enabled: ${supportedTypes || 'Device passcode'}`
              : 'Set up Face ID, Touch ID, or a device passcode to confirm payments faster.'}
          </ThemedText>
          <AppButton label="Refresh security status" variant="secondary" onPress={loadStatus} />
        </Card>
      )}
      <StateMessage
        title="Checkout return links"
        message="After Stripe or card checkout, always confirm the final payment status from BotsaPay activity before handing over goods or services."
      />
    </Screen>
  );
}
