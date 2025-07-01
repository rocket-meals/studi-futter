import React, { useCallback, useRef, useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import SupportFAQ from '@/components/SupportFAQ/SupportFAQ';
import BaseBottomSheet from '@/components/BaseBottomSheet';
import PopupEventSheet from '@/components/PopupEventSheet/PopupEventSheet';
import type BottomSheet from '@gorhom/bottom-sheet';
import { useDispatch, useSelector } from 'react-redux';
import { SET_POPUP_EVENTS } from '@/redux/Types/types';
import { useFocusEffect } from 'expo-router';
import { useLanguage } from '@/hooks/useLanguage';
import { getTitleFromTranslation } from '@/helper/resourceHelper';
import styles from './styles';
import { TranslationKeys } from '@/locales/keys';
import useSetPageTitle from '@/hooks/useSetPageTitle';
import { RootState } from '@/redux/reducer';

const EventsScreen = () => {
  useSetPageTitle(TranslationKeys.events);
  const { theme } = useTheme();
  const { translate, language } = useLanguage();
  const dispatch = useDispatch();
  const { popupEvents } = useSelector((state: RootState) => state.food);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isActive, setIsActive] = useState(false);

  const openSheet = useCallback((event: any) => {
    setSelectedEvent(event);
    bottomSheetRef.current?.expand();
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setSelectedEvent(null);
  }, []);

  const resetSeenEvents = () => {
    const resetEvents = popupEvents.map((e: any, idx: number) => ({
      ...e,
      isOpen: false,
      isCurrent: idx === 0,
    }));
    dispatch({ type: SET_POPUP_EVENTS, payload: resetEvents });
  };

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => setIsActive(false);
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.screen.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <SupportFAQ
          icon='refresh'
          label={translate(TranslationKeys.reset_seen_popup_events)}
          onPress={resetSeenEvents}
          redirectIcon={false}
        />
        {popupEvents.map((event: any) => (
          <SupportFAQ
            key={event.id}
            label={
              event.translations
                ? getTitleFromTranslation(event.translations, language)
                : event.alias
            }
            onPress={() => openSheet(event)}
          />
        ))}
      </ScrollView>
      {isActive && (
        <BaseBottomSheet
          ref={bottomSheetRef}
          index={-1}
          backgroundStyle={{
            ...styles.sheetBackground,
            backgroundColor: theme.sheet.sheetBg,
          }}
          enablePanDownToClose
          handleComponent={null}
          onClose={closeSheet}
        >
          <PopupEventSheet closeSheet={closeSheet} eventData={selectedEvent || {}} />
        </BaseBottomSheet>
      )}
    </SafeAreaView>
  );
};

export default EventsScreen;
