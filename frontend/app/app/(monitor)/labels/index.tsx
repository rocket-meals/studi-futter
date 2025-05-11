import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, DimensionValue } from 'react-native';
import styles from './styles';
import { useSelector } from 'react-redux';
import { getImageUrl } from '@/constants/HelperFunctions';
import { getTextFromTranslation } from '@/helper/resourceHelper';
import { useMyContrastColor } from '@/helper/colorHelper';
import { useTheme } from '@/hooks/useTheme';
import LabelHeader from '@/components/LabelHeader/LabelHeader';
import { iconLibraries } from '@/components/Drawer/CustomDrawerContent';
import { TranslationKeys } from '@/locales/keys';
import useSetPageTitle from '@/hooks/useSetPageTitle';
import { RootState } from '@/redux/reducer';

const index = () => {
  const { theme } = useTheme();
  useSetPageTitle(TranslationKeys.markings);

  const [currentTime, setCurrentTime] = useState('');

  const { markings } = useSelector((state: RootState) => state.food);
  const { language, selectedTheme: mode } = useSelector(
    (state: RootState) => state.settings
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formattedTime = `${now
        .toLocaleDateString('en-GB')
        .replace(/\//g, '.')} - ${now.toLocaleTimeString('en-US', {
        hour12: false,
      })}`;
      setCurrentTime(formattedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const chunkedMarkings = [];
  for (let i = 0; i < markings?.length; i += 7) {
    chunkedMarkings.push(markings?.slice(i, i + 7));
  }

  return (
    <ScrollView
      contentContainerStyle={{
        ...styles.container,
        backgroundColor: theme.screen.background,
      }}
    >
      <LabelHeader Label={'Labels'} />

      <View style={styles.gridContainer}>
        {chunkedMarkings &&
          chunkedMarkings?.map((chunk, chunkIndex) => (
            <View key={chunkIndex} style={styles.mainContainer}>
              {chunk.map((marking, index) => {
                const markingImage = marking?.image_remote_url
                  ? { uri: marking?.image_remote_url }
                  : { uri: getImageUrl(String(marking?.image)) };
                const markingText = getTextFromTranslation(
                  marking?.translations,
                  language
                );
                const MarkingBackgroundColor = marking?.background_color;
                const MarkingColor = useMyContrastColor(
                  marking?.background_color,
                  theme,
                  mode === 'dark'
                );
                const iconParts = marking?.icon?.split(':') || [];
                const [library, name] = iconParts;
                const Icon = library && iconLibraries[library];
                return (
                  <View key={index} style={styles.iconText}>
                    {markingImage?.uri && (
                      <Image
                        source={markingImage}
                        style={[
                          styles.logoImage,
                          markingImage?.uri && {
                            backgroundColor: marking?.background_color
                              ? marking?.background_color
                              : 'transparent',
                            borderRadius: marking?.background_color ? 8 : 0,
                          },
                        ]}
                      />
                    )}
                    {marking?.short_code &&
                      !marking?.icon &&
                      !markingImage?.uri && (
                        <View
                          style={{
                            ...styles.shortCode,
                            backgroundColor:
                              MarkingBackgroundColor || 'transparent',
                            borderWidth: marking?.hide_border ? 0 : 1,
                            borderColor: MarkingColor,
                          }}
                        >
                          <Text
                            style={{
                              color: MarkingColor,
                              fontSize: 16,
                              lineHeight: 18,
                            }}
                          >
                            {marking?.short_code}
                          </Text>
                        </View>
                      )}
                    {marking?.icon && !markingImage?.uri && (
                      <View
                        style={{
                          ...styles.iconMarking,
                          backgroundColor:
                            MarkingBackgroundColor || 'transparent',
                          borderWidth: marking?.hide_border ? 0 : 1,
                          borderColor: MarkingColor,
                        }}
                      >
                        <Icon name={name} size={22} color={MarkingColor} />
                      </View>
                    )}
                    <Text
                      style={{
                        ...styles.title,
                        color: theme.screen.text,
                        fontSize: 14,
                      }}
                    >
                      {markingText}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
      </View>
    </ScrollView>
  );
};

export default index;
