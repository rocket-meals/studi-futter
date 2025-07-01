import {
  ActivityIndicator,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import BaseModal from '@/components/BaseModal';
import { styles } from './styles';
import { PermissionModalProps } from './types';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ON_LOGOUT } from '@/redux/Types/types';
import { useLanguage } from '@/hooks/useLanguage';
import { persistor } from '@/redux/store';
import { useTheme } from '@/hooks/useTheme';
import { TranslationKeys } from '@/locales/keys';
import { myContrastColor } from '@/helper/colorHelper';
import { RootState } from '@/redux/reducer';

const PermissionModal: React.FC<PermissionModalProps> = ({
                                                           isVisible,
                                                           setIsVisible,
                                                         }) => {
  const { theme } = useTheme();
  const { translate } = useLanguage();
  const { primaryColor, selectedTheme: mode } = useSelector(
    (state: RootState) => state.settings
  );
  const contrastColor = myContrastColor(primaryColor, theme, mode === 'dark');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.multiRemove(['auth_data', 'persist:root']);
      dispatch({ type: ON_LOGOUT });
      dispatch({ type: 'RESET_STORE' });
      persistor.purge();
      setLoading(false);
      router.replace('/(auth)/login');
    } catch (error) {
      setLoading(false);
      console.error('Error during logout:', error);
    }
  };

  return (
    <BaseModal
      isVisible={isVisible}
      title={translate(TranslationKeys.access_limited)}
      onClose={() => setIsVisible(false)}
    >
      <Text
        style={{
          ...styles.modalSubHeading,
          color: theme.modal.text,
          fontSize: Dimensions.get('window').width < 500 ? 14 : 18,
        }}
      >
        {translate(TranslationKeys.limited_access_description)}
      </Text>
      <TouchableOpacity
        style={{
          ...styles.loginButton,
          backgroundColor: primaryColor,
          width: Dimensions.get('window').width < 500 ? '100%' : '80%',
        }}
        onPress={handleLogout}
      >
        {loading ? (
          <ActivityIndicator size={22} color={theme.background} />
        ) : (
          <Text style={{ ...styles.loginLabel, color: contrastColor }}>
            {translate(TranslationKeys.sign_in)} /{' '}
            {translate(TranslationKeys.create_account)}
          </Text>
        )}
      </TouchableOpacity>
    </BaseModal>
  );
};

export default PermissionModal;