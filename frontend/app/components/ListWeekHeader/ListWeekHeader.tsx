import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import {
  MaterialCommunityIcons,
  Ionicons,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { useLanguage } from '@/hooks/useLanguage';
import { isWeb } from '@/constants/Constants';
import { TranslationKeys } from '@/locales/keys';
import { RootState } from '@/redux/reducer';

const FoodPlanHeader = ({ handlePrint }: any) => {
  const { theme } = useTheme();
  const { translate } = useLanguage();
  const { weekPlan } = useSelector((state: RootState) => state.management);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [secondaryVisible, setSecondaryVisible] = useState(false);
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get('window').width
  );
  const isMobile = screenWidth < 800;

  const router = useRouter();

  const handleScanHelpClick = () => {
    setHeaderVisible(false);
    setSecondaryVisible(true);
  };

  const handleSecondaryClick = () => {
    setHeaderVisible(true);
    setSecondaryVisible(false);
  };

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', handleResize);

    return () => subscription?.remove();
  }, []);

  return (
    <View>
      {/* FoodPlanHeader */}
      {headerVisible && (
        <View>
          <View
            style={[
              styles.container,
              { backgroundColor: theme.header.background },
            ]}
          >
            <View style={{ flexDirection: 'row', gap: 20, width: '60%' }}>
              <TouchableOpacity
                onPress={() => router.navigate('/list-week-screen')}
              >
                <Ionicons
                  name='arrow-back'
                  size={24}
                  color={theme.screen.icon}
                />
              </TouchableOpacity>
              <Text style={[styles.title, { color: theme.header.text }]}>
                Food Plan: Week
              </Text>
            </View>
            <View style={{ ...styles.icons, gap: isMobile ? 10 : 20 }}>
              <TouchableOpacity
                onPress={() => router.navigate('/foodPlanWeek')}
              >
                <Ionicons
                  name='restaurant-sharp'
                  size={24}
                  color={theme.screen.icon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.navigate('/list-week-screen')}
              >
                <MaterialIcons
                  name='calendar-month'
                  size={24}
                  color={theme.screen.icon}
                />
              </TouchableOpacity>
              {isWeb && (
                <TouchableOpacity onPress={handlePrint}>
                  <Ionicons
                    name='print-outline'
                    size={24}
                    color={theme.screen.icon}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleScanHelpClick}>
                <MaterialCommunityIcons
                  name='scan-helper'
                  size={20}
                  color={theme.screen.icon}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 10,
            }}
          >
            <View>
              <Text style={[styles.title, { color: theme.header.text }]}>
                {weekPlan?.selectedCanteen?.alias}
              </Text>
            </View>
            <View>
              <Text style={[styles.title, { color: theme.header.text }]}>
                {`${translate(TranslationKeys.week)} ${
                  weekPlan?.selectedWeek?.week
                }`}
              </Text>
            </View>
          </View>
        </View>
      )}

      {secondaryVisible && (
        <View style={styles.textIcon}>
          <View>
            <Text style={[styles.title, { color: theme.header.text }]}>
              {weekPlan?.selectedCanteen?.alias}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={[styles.title, { color: theme.header.text }]}>
              {`${translate(TranslationKeys.week)} ${
                weekPlan?.selectedWeek?.week
              }`}
            </Text>
            <TouchableOpacity onPress={handleSecondaryClick}>
              <Feather name='minimize' size={24} color={theme.screen.icon} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
  icons: {
    flexDirection: 'row',
    width: '40%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  textIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    paddingHorizontal: 10,
  },
});

export default FoodPlanHeader;
