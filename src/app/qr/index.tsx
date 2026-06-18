import { Link } from 'expo-router';
import { ActivityIndicator, Image, View } from 'react-native';

import { useQrCodes, useUpdateQrCode } from '@/api/hooks';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { getErrorMessage } from '@/utils/errors';
import { formatDate, formatMoney } from '@/utils/format';

export default function QrListScreen() {
  const qrCodes = useQrCodes();
  const update = useUpdateQrCode();

  return (
    <Screen title="QR payments" subtitle="Create, view, activate, and deactivate wallet payment requests.">
      <Link href="/qr/create" asChild>
        <AppButton label="Create QR request" />
      </Link>
      <Link href="/qr/scan" asChild>
        <AppButton label="Scan QR" variant="secondary" />
      </Link>
      {qrCodes.isLoading && <ActivityIndicator />}
      {qrCodes.error && <StateMessage title="QR codes unavailable" message={getErrorMessage(qrCodes.error)} />}
      {qrCodes.data?.length === 0 && (
        <StateMessage title="No QR codes yet" message="Create a QR payment request for one of your wallets." />
      )}
      {qrCodes.data?.map((qr) => (
        <Card key={qr.id}>
          <View style={{ gap: 4 }}>
            <ThemedText type="smallBold">{qr.description}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatMoney(qr.amount, qr.currency)} - {qr.is_active ? 'Active' : 'Inactive'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Expires {formatDate(qr.expiry_at)}
            </ThemedText>
          </View>
          {qr.qr_image_url ? (
            <Image source={{ uri: qr.qr_image_url }} style={{ width: 160, height: 160, alignSelf: 'center' }} />
          ) : null}
          <AppButton
            label={qr.is_active ? 'Deactivate' : 'Activate'}
            variant="secondary"
            loading={update.isPending}
            onPress={() => update.mutate({ qrCodeId: qr.id, isActive: !qr.is_active })}
          />
        </Card>
      ))}
    </Screen>
  );
}
