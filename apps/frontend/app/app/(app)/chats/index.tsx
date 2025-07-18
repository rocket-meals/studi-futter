import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import { router } from 'expo-router';
import useSetPageTitle from '@/hooks/useSetPageTitle';
import { TranslationKeys } from '@/locales/keys';
import styles from './styles';

interface Chat {
  id: string;
  owner: string;
  title: string;
}

export const CHATS: Chat[] = [
  { id: '1', owner: '1', title: 'General' },
  { id: '2', owner: '2', title: 'Project X' },
];

const ChatsScreen = () => {
  useSetPageTitle(TranslationKeys.chats);
  const { theme } = useTheme();
  const { translate } = useLanguage();

  const renderItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={{ ...styles.chatItem, backgroundColor: theme.screen.iconBg }}
      onPress={() =>
        router.push({ pathname: '/chats/details', params: { chat_id: item.id } })
      }
    >
      <Text style={{ ...styles.chatTitle, color: theme.screen.text }}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.screen.background }]}>
      <FlatList
        data={CHATS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default ChatsScreen;
