import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './styles';
import { useTheme } from '@/hooks/useTheme';
import { isWeb } from '@/constants/Constants';
import RedirectButton from '@/components/RedirectButton';
import { useSelector } from 'react-redux';
import MarkingLabels from '@/components/MarkingLabels/MarkingLabels';
import { FoodoffersMarkings } from '@/constants/types';
import { useLanguage } from '@/hooks/useLanguage';
import { excerpt } from '@/constants/HelperFunctions';
import animation from '@/assets/animations/allergist.json';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from 'expo-router';
import { replaceLottieColors } from '@/helper/animationHelper';
import { TranslationKeys } from '@/locales/keys';
import useSetPageTitle from '@/hooks/useSetPageTitle';
import { RootState } from '@/redux/reducer';

const index = () => {
  useSetPageTitle(TranslationKeys.eating_habits);
  const { theme } = useTheme();
  const { translate } = useLanguage();
  const { markings } = useSelector((state: RootState) => state.food);
  const { primaryColor, appSettings } = useSelector(
    (state: RootState) => state.settings
  );
  const [readMore, setReadMore] = useState(false);
  const [autoPlay, setAutoPlay] = useState(appSettings?.animations_auto_start);
  const animationRef = useRef<LottieView>(null);
  const [animationJson, setAmimationJson] = useState<any>(null);
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get('window').width
  );

  useFocusEffect(
    useCallback(() => {
      setAmimationJson(replaceLottieColors(animation, primaryColor));
      return () => {
        setAmimationJson(null);
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      setAutoPlay(appSettings?.animations_auto_start); // Enable when entering

      return () => {
        setAutoPlay(false); // Reset when leaving
        setAmimationJson(null);
      };
    }, [appSettings?.animations_auto_start])
  );

  useEffect(() => {
    if (animationJson && autoPlay && animationRef.current) {
      animationRef?.current?.play(); // Reset animation to ensure it starts fresh
    }
  }, [animationJson, autoPlay]);

  const renderLottie = useMemo(() => {
    if (animationJson) {
      return (
        <LottieView
          ref={animationRef}
          source={animationJson}
          resizeMode='contain'
          style={{ width: '100%', height: '100%' }}
          autoPlay={autoPlay || false}
          loop={false}
        />
      );
    }
  }, [autoPlay, animationJson]);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(Dimensions.get('window').width);
      if (Dimensions.get('window').width > 600) {
        setReadMore(true);
      }
    };

    const subscription = Dimensions.addEventListener('change', handleResize);

    return () => subscription?.remove();
  }, []);

  const handleReadMore = () => {
    setReadMore(!readMore);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.screen.background }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ backgroundColor: theme.screen.background }}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.gifContainer}>{renderLottie}</View>
          <View
            style={{
              ...styles.eatingHabitsContainer,
              width: isWeb ? (screenWidth > 600 ? '80%' : '100%') : '100%',
            }}
          >
            <Text style={{ ...styles.body1, color: theme.screen.text }}>
              {readMore
                ? translate(TranslationKeys.eatinghabits_introduction)
                : excerpt(
                    translate(TranslationKeys.eatinghabits_introduction),
                    120
                  )}
            </Text>
            {readMore && (
              <Text style={{ ...styles.body2, color: theme.screen.text }}>
                {translate(TranslationKeys.FOOD_LABELING_INFO)}
              </Text>
            )}
            {screenWidth < 600 && (
              <View style={styles.readMoreContainer}>
                <TouchableOpacity
                  onPress={handleReadMore}
                  style={{
                    ...styles.readMoreButton,
                    backgroundColor: theme.primary,
                  }}
                >
                  <Text style={{ ...styles.readMore, color: theme.activeText }}>
                    {readMore
                      ? translate(TranslationKeys.read_less)
                      : translate(TranslationKeys.read_more)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <RedirectButton
              type={'link'}
              label='Studentenwerk Osnabrueck'
              backgroundColor={primaryColor}
              color={theme.activeText}
            />
            <View style={styles.feedbackLabelsContainer}>
              {markings?.map((marking) => {
                return (
                  <MarkingLabels key={marking?.id} markingId={marking?.id} />
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default index;
