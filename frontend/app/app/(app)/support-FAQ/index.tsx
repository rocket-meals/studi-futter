import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Dimensions,
  View,
  Image,
  Platform,
  Linking,
  Text,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import SupportFAQ from '../../../components/SupportFAQ/SupportFAQ';
import styles from './styles';
import { useLanguage } from '@/hooks/useLanguage';
import useToast from '@/hooks/useToast';
import { useSelector } from 'react-redux';
import { TranslationKeys } from '@/locales/keys';
import useSetPageTitle from '@/hooks/useSetPageTitle';
import { RootState } from '@/redux/reducer';

const supportfaq = () => {
  useSetPageTitle(TranslationKeys.feedback_support_faq);
  const { translate } = useLanguage();
  const { theme } = useTheme();
  const toast = useToast();
  const { profile } = useSelector((state: RootState) => state.authReducer);
  const [projectName, setProjectName] = useState('');
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get('window').width
  );
  const { serverInfo, appSettings } = useSelector(
    (state: RootState) => state.settings
  );

  useEffect(() => {
    if (serverInfo && serverInfo?.info) {
      setProjectName(serverInfo?.info?.project?.project_name);
    }
  }, [serverInfo]);
  useEffect(() => {
    const onChange = ({ window }: { window: any }) => {
      setWindowWidth(window.width);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const openInBrowser = async (url: string) => {
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        const supported = await Linking.canOpenURL(url);

        if (supported) {
          await Linking.openURL(url);
        } else {
          toast(`Cannot open URL: ${url}`, 'error');
        }
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: theme.screen.background,
      }}
    >
      <ScrollView>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/dataAccess.png')}
              style={styles.image}
            />
          </View>

          <View
            style={[
              styles.section,
              { width: windowWidth > 600 ? '85%' : '95%' },
            ]}
          >
            <SupportFAQ
              icon='feedback'
              label={`${translate(TranslationKeys.feedback)} & ${translate(
                TranslationKeys.support
              )}`}
              text=''
              onPress={() => router.navigate('/feedback-support')}
              isArrowRight={true}
              redirectIcon={false}
            />
            {profile?.id && (
              <SupportFAQ
                icon='email'
                label={translate(TranslationKeys.my_support_tickets)}
                redirectIcon={false}
                text=''
                onPress={() => {
                  if (profile?.id) {
                    router.navigate('/support-ticket');
                  } else {
                    toast(
                      'No permission to view My Support Tickets. Please log in.',
                      'error'
                    );
                  }
                }}
              />
            )}
          </View>

          <View
            style={[
              styles.section,
              { width: windowWidth > 600 ? '85%' : '95%' },
            ]}
          >
            <SupportFAQ
              icon='logo-apple'
              label='Apple Store'
              text=''
              isArrowRight={false}
              onPress={() => {
                if (appSettings?.app_stores_url_to_apple) {
                  openInBrowser(appSettings?.app_stores_url_to_apple);
                }
              }}
            />
            <SupportFAQ
              icon='logo-google-playstore'
              label='Google Play Store'
              text=''
              isArrowRight={false}
              onPress={() => {
                if (appSettings?.app_stores_url_to_google) {
                  openInBrowser(appSettings?.app_stores_url_to_google);
                }
              }}
            />
            <SupportFAQ
              icon='email'
              label={translate(TranslationKeys.email)}
              isArrowRight={false}
              text='info@rocket-meals.de'
              onPress={() => {
                Linking.openURL(`mailto:info@rocket-meals.de`);
              }}
            />
          </View>

          <View
            style={[
              styles.section,
              { width: windowWidth > 600 ? '85%' : '95%' },
            ]}
          >
            <View
              style={{ ...styles.row, backgroundColor: theme.screen.iconBg }}
            >
              <View style={styles.leftView}>
                <Text
                  style={[
                    styles.linkText,
                    {
                      color: theme.screen.text,
                      fontSize: windowWidth < 500 ? 14 : 18,
                    },
                  ]}
                >
                  {translate(TranslationKeys.project_name)}
                </Text>
              </View>
              <View style={styles.textIcon}>
                <Text
                  style={[
                    styles.iconText,
                    {
                      color: theme.screen.text,
                      fontSize: windowWidth < 500 ? 14 : 18,
                    },
                  ]}
                >
                  {projectName?.length > 0 ? projectName : 'SWOSY Test'}
                </Text>
              </View>
            </View>

            <SupportFAQ
              label={translate(TranslationKeys.developer)}
              isArrowRight={false}
              text='Baumgartner Software UG'
              onPress={() => {
                openInBrowser('https://baumgartner-software.de/homepage/');
              }}
            />
            <SupportFAQ
              label={translate(TranslationKeys.software_name)}
              text='Rocket Meals'
              isArrowRight={false}
              onPress={() => {
                openInBrowser('https://rocket-meals.de/homepage/');
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default supportfaq;
