import { Link } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, View } from 'react-native';

import { useProfile, useUpdateProfile, useUploadProfileAvatar } from '@/api/hooks';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppIcon } from '@/components/ui/app-icon';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { signOut } from '@/services/auth';
import { getErrorMessage } from '@/utils/errors';
import { getDisplayName } from '@/utils/format';

type DetailRowProps = {
  label: string;
  value?: string | null;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <ThemedText type="small" themeColor="textSecondary">{label}</ThemedText>
      <ThemedText type="smallBold">{value?.trim() || 'Not added'}</ThemedText>
    </View>
  );
}

export default function ProfileTab() {
  const theme = useTheme();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadProfileAvatar();
  const [editing, setEditing] = useState(false);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    if (profile.data) {
      setFirstName(profile.data.first_name ?? '');
      setLastName(profile.data.last_name ?? '');
      setPhoneNumber(profile.data.phone_number ?? '');
      setDateOfBirth(profile.data.date_of_birth ?? '');
      setAddressLine1(profile.data.address_line1 ?? '');
      setAddressLine2(profile.data.address_line2 ?? '');
      setCity(profile.data.city ?? '');
      setState(profile.data.state ?? '');
      setPostalCode(profile.data.postal_code ?? '');
      setCountry(profile.data.country ?? '');
      setLocalAvatarUri(null);
    }
  }, [profile.data]);

  const displayName = getDisplayName(profile.data?.first_name, profile.data?.last_name, profile.data?.email);
  const initials = useMemo(() => {
    const source = [profile.data?.first_name, profile.data?.last_name].filter(Boolean).join(' ') || profile.data?.email || 'B';
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }, [profile.data?.email, profile.data?.first_name, profile.data?.last_name]);
  const avatarUri = localAvatarUri || profile.data?.avatar_url || null;
  const fullAddress = [profile.data?.address_line1, profile.data?.address_line2, profile.data?.city, profile.data?.state, profile.data?.postal_code, profile.data?.country]
    .filter(Boolean)
    .join(', ');

  function resetForm() {
    if (!profile.data) {
      return;
    }

    setFirstName(profile.data.first_name ?? '');
    setLastName(profile.data.last_name ?? '');
    setPhoneNumber(profile.data.phone_number ?? '');
    setDateOfBirth(profile.data.date_of_birth ?? '');
    setAddressLine1(profile.data.address_line1 ?? '');
    setAddressLine2(profile.data.address_line2 ?? '');
    setCity(profile.data.city ?? '');
    setState(profile.data.state ?? '');
    setPostalCode(profile.data.postal_code ?? '');
    setCountry(profile.data.country ?? '');
    setLocalAvatarUri(null);
  }

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo library access to choose a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.82,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    setLocalAvatarUri(asset.uri);

    try {
      await uploadAvatar.mutateAsync({
        uri: asset.uri,
        fileName: 'profile-avatar.jpg',
        mimeType: 'image/jpeg',
      });
      Alert.alert('Photo updated', 'Your profile picture has been updated.');
    } catch (error) {
      Alert.alert('Photo not saved', getErrorMessage(error));
    }
  }

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
      Alert.alert('Check your profile', 'Please enter your first name, last name, and phone number.');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber.trim(),
        date_of_birth: dateOfBirth.trim(),
        address_line1: addressLine1.trim(),
        address_line2: addressLine2.trim(),
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        country: country.trim(),
      });
      setEditing(false);
      Alert.alert('Profile saved', 'Your profile has been updated.');
    } catch (error) {
      Alert.alert('Save failed', getErrorMessage(error));
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign out?', 'You will need to sign in again to access your wallets.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert('Sign out failed', getErrorMessage(error));
          }
        },
      },
    ]);
  }

  return (
    <Screen title="Profile" subtitle="Manage your personal details and account security." showBackButton>
      {profile.isLoading && <ActivityIndicator />}
      {profile.error && <StateMessage title="Profile unavailable" message={getErrorMessage(profile.error)} />}
      {profile.data?.status && profile.data.status !== 'active' && (
        <StateMessage
          title="Account attention needed"
          message={`Your account status is ${profile.data.status}. Some wallet actions may be limited.`}
        />
      )}

      <Card style={styles.headerCard}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          onPress={handlePickAvatar}
          style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <ThemedText type="subtitle" style={{ color: theme.primary }}>{initials}</ThemedText>
          )}
          <View style={[styles.cameraBadge, { backgroundColor: theme.primary }]}>
            <AppIcon name={{ ios: 'camera.fill', android: 'photo_camera' }} size={16} tintColor={theme.primaryText} />
          </View>
        </Pressable>
        <View style={styles.headerCopy}>
          <ThemedText type="subtitle" style={styles.name}>{displayName}</ThemedText>
          <ThemedText themeColor="textSecondary">{profile.data?.email}</ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: theme.primarySoft }]}>
            <ThemedText type="smallBold" style={{ color: theme.primary }}>
              {profile.data?.status ?? 'active'} account
            </ThemedText>
          </View>
        </View>
        <AppButton
          label={editing ? 'Cancel editing' : 'Edit profile'}
          variant={editing ? 'ghost' : 'secondary'}
          onPress={() => {
            if (editing) {
              resetForm();
            }
            setEditing((value) => !value);
          }}
        />
      </Card>

      {editing ? (
        <Card>
          <ThemedText type="smallBold">Personal information</ThemedText>
          <TextField label="First name" value={firstName} onChangeText={setFirstName} textContentType="givenName" />
          <TextField label="Last name" value={lastName} onChangeText={setLastName} textContentType="familyName" />
          <TextField
            label="Phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
          />
          <TextField
            label="Date of birth"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="YYYY-MM-DD"
          />

          <ThemedText type="smallBold" style={styles.sectionGap}>Address</ThemedText>
          <TextField label="Address line 1" value={addressLine1} onChangeText={setAddressLine1} textContentType="streetAddressLine1" />
          <TextField label="Address line 2" value={addressLine2} onChangeText={setAddressLine2} textContentType="streetAddressLine2" />
          <TextField label="City" value={city} onChangeText={setCity} textContentType="addressCity" />
          <TextField label="State / region" value={state} onChangeText={setState} textContentType="addressState" />
          <TextField label="Postal code" value={postalCode} onChangeText={setPostalCode} textContentType="postalCode" />
          <TextField label="Country" value={country} onChangeText={setCountry} textContentType="countryName" />
          <AppButton label="Save changes" loading={updateProfile.isPending} onPress={handleSave} />
        </Card>
      ) : (
        <>
          <Card>
            <ThemedText type="smallBold">Personal information</ThemedText>
            <DetailRow label="First name" value={profile.data?.first_name} />
            <DetailRow label="Last name" value={profile.data?.last_name} />
            <DetailRow label="Email" value={profile.data?.email} />
            <DetailRow label="Phone number" value={profile.data?.phone_number} />
            <DetailRow label="Date of birth" value={profile.data?.date_of_birth} />
          </Card>

          <Card>
            <ThemedText type="smallBold">Address</ThemedText>
            <DetailRow label="Primary address" value={fullAddress} />
          </Card>
        </>
      )}

      <Card>
        <ThemedText type="smallBold">Account</ThemedText>
        <Link href="/settings" asChild>
          <AppButton label="Security settings" variant="secondary" icon={{ ios: 'lock.shield.fill', android: 'security' }} />
        </Link>
        <AppButton label="Logout" variant="danger" icon={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout' }} onPress={handleSignOut} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  name: {
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
  },
  statusBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  detailRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D6E2F5',
    paddingVertical: Spacing.two,
    gap: Spacing.half,
  },
  sectionGap: {
    marginTop: Spacing.two,
  },
});
