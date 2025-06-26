import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dispatch } from 'redux';
import {
  CLEAR_ANONYMOUSLY,
  CLEAR_APARTMENTS,
  CLEAR_CAMPUSES,
  CLEAR_CANTEENS,
  CLEAR_COLLECTION_DATES_LAST_UPDATED,
  CLEAR_FOODS,
  CLEAR_MANAGEMENT,
  CLEAR_NEWS,
  CLEAR_SETTINGS,
  CLEAR_POPUP_EVENTS_HASH,
  ON_LOGOUT,
} from '@/redux/Types/types';

export const performLogout = async (
  dispatch: Dispatch,
  router: { push: (args: { pathname: string; params?: Record<string, string> }) => void },
  asGuest: boolean = false,
) => {
  try {
    dispatch({ type: CLEAR_CANTEENS });
    dispatch({ type: CLEAR_CAMPUSES });
    dispatch({ type: CLEAR_APARTMENTS });
    dispatch({ type: CLEAR_FOODS });
    dispatch({ type: CLEAR_MANAGEMENT });
    dispatch({ type: CLEAR_NEWS });
    dispatch({ type: CLEAR_SETTINGS });
    dispatch({ type: CLEAR_POPUP_EVENTS_HASH });
    dispatch({ type: CLEAR_COLLECTION_DATES_LAST_UPDATED });
    await AsyncStorage.multiRemove(['auth_data', 'persist:root']);
    if (asGuest) {
      dispatch({ type: CLEAR_ANONYMOUSLY });
      dispatch({ type: CLEAR_ANONYMOUSLY });
    } else {
      dispatch({ type: ON_LOGOUT });
    }
    router.push({ pathname: '/(auth)/login', params: { logout: 'true' } });
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
