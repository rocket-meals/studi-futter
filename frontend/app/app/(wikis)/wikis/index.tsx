import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import styles from './styles';
import { useTheme } from '@/hooks/useTheme';
import { useSelector } from 'react-redux';
import {
  getTextFromTranslation,
  getTitleFromTranslation,
} from '@/helper/resourceHelper';
import {
  router,
  useGlobalSearchParams,
  useLocalSearchParams,
} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { isWeb } from '@/constants/Constants';
import DeviceMock from '@/components/DeviceMock/DeviceMock';
import useSetPageTitle from '@/hooks/useSetPageTitle';
import { Wikis } from '@/constants/types';
import CustomMarkdown from '@/components/CustomMarkdown/CustomMarkdown';
import { RootState } from '@/redux/reducer';

const index = () => {
  const { theme } = useTheme();
  const [wiki, setWiki] = useState<Wikis>();
  const [loading, setLoading] = useState(false);
  const { wikis, language, primaryColor } = useSelector(
    (state: RootState) => state.settings
  );
  const { deviceMock } = useGlobalSearchParams();
  const { custom_id, id } = useLocalSearchParams();
  //Set Page Title
  const title = wiki?.translations
    ? getTitleFromTranslation(wiki?.translations, language)
    : 'Wikis';
  useSetPageTitle(title);

  const filterWiki = () => {
    setLoading(true);
    const wiki_data = wikis?.filter(
      (wiki: any) => wiki?.custom_id === custom_id
    );
    if (wiki_data) {
      setWiki(wiki_data[0]);
    }
    setLoading(false);
  };

  const filterWikiWithId = () => {
    setLoading(true);
    const wiki_data = wikis?.filter((wiki: any) => wiki?.id === id);
    if (wiki_data) {
      setWiki(wiki_data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (wikis && custom_id) {
      filterWiki();
    }
  }, [wikis, custom_id]);

  useEffect(() => {
    if (wikis && id) {
      filterWikiWithId();
    }
  }, [wikis, id]);

  return (
    <ScrollView
      style={{ ...styles.container, backgroundColor: theme.screen.background }}
    >
      {deviceMock && deviceMock === 'iphone' && isWeb && <DeviceMock />}
      <View
        style={{
          ...styles.header,
          backgroundColor: theme.header.background,
          paddingHorizontal: isWeb ? 20 : 10,
        }}
      >
        <View style={styles.row}>
          <View style={styles.col1}>
            <TouchableOpacity
              onPress={() => router.navigate('/foodoffers')}
              style={{ padding: 10 }}
            >
              <Ionicons name='arrow-back' size={24} color={theme.header.text} />
            </TouchableOpacity>
            <Text style={{ ...styles.heading, color: theme.header.text }}>
              {wiki?.translations &&
                getTitleFromTranslation(wiki?.translations, language)}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.content}>
        {loading ? (
          <View
            style={{
              height: 200,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size={30} color={theme.screen.text} />
          </View>
        ) : (
          wiki &&
          wiki?.translations && (
            <CustomMarkdown
              content={
                getTextFromTranslation(wiki.translations, language) || ''
              }
              backgroundColor={wiki?.color || primaryColor}
              imageWidth={'100%'}
              imageHeight={400}
            />
          )
        )}
      </View>
    </ScrollView>
  );
};

export default index;
