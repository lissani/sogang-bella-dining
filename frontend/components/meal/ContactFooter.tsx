import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { WeeklyMenuResponse } from '@/types/menu';

type ContactFooterProps = {
  meta?: WeeklyMenuResponse['meta'];
};

export function ContactFooter({ meta }: ContactFooterProps) {
  const theme = useTheme();

  if (!meta) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {meta.institution} · {meta.provider}
      </Text>
      <Text variant="labelSmall" style={[styles.contactLine, { color: theme.colors.outline }]}>
        식단 문의: {meta.contacts.email}
      </Text>
      <Text variant="labelSmall" style={[styles.contactLine, { color: theme.colors.outline }]}>
        앱 관련 문의: girinjeong@gmail.com
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  contactLine: {
    textAlign: 'center',
  },
});
