import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { isWeb } from '@/constants/Constants';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';
import { CustomStackHeaderProps } from './types';
import { useRouter } from 'expo-router';
import { usePathname } from 'expo-router';
import { useSelector } from 'react-redux';
import { excerpt } from '@/constants/HelperFunctions';
import { Tooltip, TooltipContent, TooltipText } from '@gluestack-ui/themed';
import { useLanguage } from '@/hooks/useLanguage';
import { TranslationKeys } from '@/locales/keys';
import { RootState } from '@/redux/reducer';
const CustomStackHeader: React.FC<CustomStackHeaderProps> = ({ label }) => {
  const { theme } = useTheme();
  const { translate } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const { loggedIn } = useSelector((state: RootState) => state.authReducer);
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get('window').width
  );

  const handleGoback = () => {
    if (pathname.includes('/foodoffers/details')) {
      router.navigate('/foodoffers');
    } else if (pathname.includes('/housing/details')) {
      router.navigate('/housing');
    } else if (pathname.includes('/statistics')) {
      router.navigate('/management');
    } else if (pathname.includes('/support-ticket')) {
      router.navigate('/support-FAQ');
    } else if (pathname.includes('/feedback-support')) {
      router.navigate('/support-FAQ');
    } else if (pathname.includes('/support-FAQ')) {
      router.navigate('/settings');
    } else if (pathname.includes('/delete-user')) {
      if (loggedIn) {
        router.navigate('/settings');
      } else {
        router.navigate('/login');
      }
    } else if (pathname.includes('/campus/details')) {
      router.navigate('/campus');
    } else if (pathname.includes('/list-week-screen')) {
      router.navigate('/foodPlanWeek');
    } else if (pathname.includes('/foodPlanWeek')) {
      router.navigate('/management');
    } else if (pathname.includes('/forms')) {
      router.navigate('/form-categories');
    } else if (pathname.includes('/form-categories')) {
      router.navigate('/management');
    } else if (router.canGoBack()) {
      router.back();
    } else if (loggedIn) {
      router.navigate('/foodoffers');
    } else {
      router.navigate('/login');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', handleResize);

    return () => subscription?.remove();
  }, []);

  return (
    <View
      style={{
        ...styles.header,
        backgroundColor: theme.header.background,
        paddingHorizontal: isWeb ? 20 : 10,
      }}
    >
      <View style={styles.row}>
        <View style={styles.col1}>
          <Tooltip
            placement='top'
            trigger={(triggerProps) => (
              <TouchableOpacity
                {...triggerProps}
                onPress={handleGoback}
                style={{ padding: 10 }}
              >
                <Ionicons
                  name='arrow-back'
                  size={26}
                  color={theme.header.text}
                />
              </TouchableOpacity>
            )}
          >
            <TooltipContent bg={theme.tooltip.background} py='$1' px='$2'>
              <TooltipText fontSize='$sm' color={theme.tooltip.text}>
                {`${translate(TranslationKeys.navigate_back)}`}
              </TooltipText>
            </TooltipContent>
          </Tooltip>

          <Text style={{ ...styles.heading, color: theme.header.text }}>
            {excerpt(
              label,
              screenWidth > 900 ? 100 : screenWidth > 700 ? 80 : 22
            )}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CustomStackHeader;
