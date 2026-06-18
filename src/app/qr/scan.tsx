import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppButton } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { extractQrToken } from '@/utils/format';

export default function ScanQrScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission?.granted) {
    return (
      <Screen title="Scan QR" subtitle="Camera access is required to scan BotsaPay QR payment codes.">
        <StateMessage title="Camera permission needed" message="Allow camera access to scan QR codes." />
        <AppButton label="Allow camera" onPress={requestPermission} />
      </Screen>
    );
  }

  return (
    <Screen title="Scan QR" subtitle="Point your Android camera at a BotsaPay QR payment code." scroll={false}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={
          scanned
            ? undefined
            : ({ data }) => {
                setScanned(true);
                router.push(`/qr/pay?token=${encodeURIComponent(extractQrToken(data))}`);
              }
        }
      />
      <AppButton label="Scan again" variant="secondary" onPress={() => setScanned(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  camera: {
    minHeight: 420,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
