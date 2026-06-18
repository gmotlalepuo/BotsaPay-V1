import { useEffect, useState } from 'react';
import { Alert, ActivityIndicator } from 'react-native';

import { useProfile, useUpdateProfile } from '@/api/hooks';
import { signOut } from '@/services/auth';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
import { getErrorMessage } from '@/utils/errors';

export default function ProfileTab() {
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (profile.data) {
      setFirstName(profile.data.first_name ?? '');
      setLastName(profile.data.last_name ?? '');
      setPhoneNumber(profile.data.phone_number ?? '');
    }
  }, [profile.data]);

  async function handleSave() {
    try {
      await updateProfile.mutateAsync({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber.trim(),
      });
      Alert.alert('Profile saved', 'Your profile has been updated.');
    } catch (error) {
      Alert.alert('Save failed', getErrorMessage(error));
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Sign out failed', getErrorMessage(error));
    }
  }

  return (
    <Screen title="Profile" subtitle="Keep your customer details up to date.">
      {profile.isLoading && <ActivityIndicator />}
      {profile.error && <StateMessage title="Profile unavailable" message={getErrorMessage(profile.error)} />}
      <Card>
        <TextField label="First name" value={firstName} onChangeText={setFirstName} />
        <TextField label="Last name" value={lastName} onChangeText={setLastName} />
        <TextField label="Phone number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
        <AppButton label="Save profile" loading={updateProfile.isPending} onPress={handleSave} />
        <AppButton label="Sign out" variant="danger" onPress={handleSignOut} />
      </Card>
    </Screen>
  );
}
