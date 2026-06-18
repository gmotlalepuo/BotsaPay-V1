import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { useComplaints, useCreateComplaint } from '@/api/hooks';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { TextField } from '@/components/ui/text-field';
import { getErrorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/format';

export default function ComplaintsScreen() {
  const complaints = useComplaints();
  const createComplaint = useCreateComplaint();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [complaintType, setComplaintType] = useState('failed_transaction');

  async function handleSubmit() {
    try {
      await createComplaint.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        complaintType: complaintType.trim(),
        attachmentUrls: [],
      });
      setTitle('');
      setDescription('');
      Alert.alert('Complaint submitted', 'Support will review your complaint.');
    } catch (error) {
      Alert.alert('Submission failed', getErrorMessage(error));
    }
  }

  return (
    <Screen title="Support" subtitle="Submit and track complaints or transaction disputes.">
      <Card>
        <TextField label="Complaint type" value={complaintType} onChangeText={setComplaintType} />
        <TextField label="Title" value={title} onChangeText={setTitle} />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          style={{ minHeight: 96, textAlignVertical: 'top' }}
        />
        <AppButton
          label="Submit complaint"
          loading={createComplaint.isPending}
          disabled={!title.trim() || !description.trim()}
          onPress={handleSubmit}
        />
      </Card>

      {complaints.isLoading && <ActivityIndicator />}
      {complaints.error && <StateMessage title="Complaints unavailable" message={getErrorMessage(complaints.error)} />}
      {complaints.data?.map((complaint) => (
        <Card key={complaint.id}>
          <View>
            <ThemedText type="smallBold">{complaint.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {complaint.status} - {formatDate(complaint.created_at)}
            </ThemedText>
          </View>
          <ThemedText>{complaint.description}</ThemedText>
        </Card>
      ))}
    </Screen>
  );
}
