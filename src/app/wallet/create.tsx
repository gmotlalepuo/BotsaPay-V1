import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { useCreateWallet } from '@/api/hooks';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { getErrorMessage } from '@/utils/errors';

export default function CreateWalletScreen() {
  const createWallet = useCreateWallet();
  const [name, setName] = useState('Main wallet');
  const [currency, setCurrency] = useState('BWP');

  async function handleCreate() {
    try {
      await createWallet.mutateAsync({ name: name.trim(), currency: currency.trim().toUpperCase() || 'BWP' });
      router.back();
    } catch (error) {
      Alert.alert('Wallet creation failed', getErrorMessage(error));
    }
  }

  return (
    <Screen title="Create wallet" subtitle="Add a new BotsaPay wallet for receiving and sending money.">
      <Card>
        <TextField label="Wallet name" value={name} onChangeText={setName} />
        <TextField label="Currency" value={currency} onChangeText={setCurrency} autoCapitalize="characters" />
        <AppButton label="Create wallet" loading={createWallet.isPending} onPress={handleCreate} />
      </Card>
    </Screen>
  );
}
