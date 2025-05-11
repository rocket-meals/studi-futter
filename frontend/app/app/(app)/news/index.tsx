import {
  SafeAreaView,
  ScrollView,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import styles from './styles';
import { isWeb } from '@/constants/Constants';
import NewsItem from '@/components/NewsItem/NewsItem';
import { NewsHelper } from '@/redux/actions/News/News';
import { News } from '@/constants/types';
import { useDispatch, useSelector } from 'react-redux';
import { SET_NEWS } from '@/redux/Types/types';
import useSetPageTitle from '@/hooks/useSetPageTitle';
import { TranslationKeys } from '@/locales/keys';
import { RootState } from '@/redux/reducer';

const index = () => {
  useSetPageTitle(TranslationKeys.news);
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const newsHelper = new NewsHelper();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { news } = useSelector((state: RootState) => state.news);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllNews();
    setRefreshing(false);
  }, []);

  const fetchAllNews = async () => {
    setLoading(true);
    const newsData = (await newsHelper.fetchNews({})) as News[];
    const news = newsData || [];
    if (news) {
      dispatch({ type: SET_NEWS, payload: news });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllNews();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.screen.background }}>
      <ScrollView
        style={{
          ...styles.newsContainer,
          backgroundColor: theme.screen.background,
        }}
        contentContainerStyle={{
          ...styles.newsContentContainer,
          paddingHorizontal: isWeb ? 30 : 5,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.newsListContainer}>
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
            news &&
            news?.map((item: News, index: number) => {
              if (item?.translations?.length > 1) {
                return <NewsItem key={item?.id} news={item} />;
              }
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default index;
