import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams } from 'expo-router';
import useSetPageTitle from '@/hooks/useSetPageTitle';
import { TranslationKeys } from '@/locales/keys';
import MyMarkdown from '@/components/MyMarkdown/MyMarkdown';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducer';
import { myContrastColor } from '@/helper/colorHelper';
import { CHATS } from '../index';
import styles from './styles';

interface ChatMessage {
  id: string;
  chat_id: string;
  profile_id: string;
  text: string;
  timestamp: string;
}

const MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    chat_id: '1',
    profile_id: '1',
    text: 'Hallo **Welt**! Dies ist eine längere Testnachricht, um das neue Layout zu überprüfen.',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'm2',
    chat_id: '1',
    profile_id: '2',
    text: 'Klingt gut! So können wir sehen, wie längere Texte in den Bubbles wirken.',
    timestamp: new Date(Date.now() - 1000000).toISOString(),
  },
  {
    id: 'm3',
    chat_id: '1',
    profile_id: '1',
    text: 'Super, ich freue mich auf dein Feedback.',
    timestamp: new Date(Date.now() - 2000000).toISOString(),
  },
  {
    id: 'm4',
    chat_id: '2',
    profile_id: '2',
    text: 'Willkommen im Projekt X Chat. Hast du die neuesten Änderungen gesehen?',
    timestamp: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'm5',
    chat_id: '2',
    profile_id: '1',
    text: 'Ja, die Updates sehen vielversprechend aus. Wir sollten sie bald testen.',
    timestamp: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: 'm6',
    chat_id: '2',
    profile_id: '2',
    text: 'Absolut. Ich plane, morgen einen kurzen Build zu erstellen.',
    timestamp: new Date(Date.now() - 4000000).toISOString(),
  },
];

const ChatDetailsScreen = () => {
  useSetPageTitle(TranslationKeys.chat);
  const { theme } = useTheme();
  const { chat_id } = useLocalSearchParams<{ chat_id?: string }>();
  const { primaryColor: projectColor, selectedTheme: mode } = useSelector(
    (state: RootState) => state.settings
  );

  const chatMessages = MESSAGES.filter((m) => m.chat_id === chat_id);
  chatMessages.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const chatTitle = CHATS.find((c) => c.id === chat_id)?.title || 'Chat';

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.profile_id === '1';
    const bgColor = isMe ? projectColor : theme.card.background;
    const textColor = myContrastColor(bgColor, theme, mode === 'dark');
    return (
      <View
        style={[
          styles.messageItem,
          { alignSelf: isMe ? 'flex-end' : 'flex-start' },
        ]}
      >
        <View style={[styles.bubble, { backgroundColor: bgColor }]}>
          <MyMarkdown content={item.text} textColor={textColor} />
        </View>
        <Text
          style={{
            ...styles.timestamp,
            color: theme.screen.text,
            textAlign: isMe ? 'right' : 'left',
          }}
        >
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.screen.background }]}>
      <FlatList
        data={chatMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default ChatDetailsScreen;
