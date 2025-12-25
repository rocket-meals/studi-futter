import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { useMyScrollViewModal } from '@/components/GlobalModal/useMyScrollViewModal';
import SettingsList from '@/components/SettingsList';
import languageStyles from '@/components/LanguageSheet/styles';
import { languages } from '@/constants/SettingData';
import { TranslationKeys } from '@/locales/keys';
import { RootState } from '@/redux/reducer';

export const useLanguageModal = () => {
        const { show: showScrollViewModal, close: closeScrollViewModal } = useMyScrollViewModal();
        const { translate, setLanguageMode, language } = useLanguage();
        const { theme } = useTheme();
        const { primaryColor } = useSelector((state: RootState) => state.settings);

        const changeLanguage = useCallback(
                (languageOption: (typeof languages)[number]) => {
                        setLanguageMode(languageOption.value);
                        closeScrollViewModal();
                },
                [closeScrollViewModal, setLanguageMode]
        );

        const LanguageOption = useCallback(
                ({ languageOption, index }: { languageOption: (typeof languages)[number]; index: number }) => {
                        const isSelected = language === languageOption.value;
                        const groupPosition =
                                languages.length === 1
                                        ? 'single'
                                        : index === 0
                                                ? 'top'
                                                : index === languages.length - 1
                                                        ? 'bottom'
                                                        : 'middle';

                        return (
                                <SettingsList
                                        key={`${languageOption.value}-${index}`}
                                        label={languageOption.label}
                                        leftIcon={
                                                <View style={languageStyles.flagWrapper}>
                                                        <Text style={languageStyles.flagText}>{languageOption.emoji}</Text>
                                                </View>
                                        }
                                        iconBgColor="transparent"
                                        showSeparator={index !== languages.length - 1}
                                        groupPosition={groupPosition}
                                        noIconIndent
                                        rightIcon={
                                                <MaterialCommunityIcons
                                                        name={isSelected ? 'circle' : 'circle-outline'}
                                                        size={24}
                                                        color={isSelected ? primaryColor : theme.screen.icon}
                                                />
                                        }
                                        handleFunction={() => changeLanguage(languageOption)}
                                />
                        );
                },
                [changeLanguage, language, primaryColor, theme.screen.icon]
        );

        const openLanguageModal = useCallback(() => {
                showScrollViewModal(
                        {
                                title: translate(TranslationKeys.language),
                                children: (
                                        <View style={languageStyles.optionsContainer}>
                                                {languages.map((languageOption, index) => (
                                                        <LanguageOption
                                                                key={`${languageOption.value}-${index}`}
                                                                languageOption={languageOption}
                                                                index={index}
                                                        />
                                                ))}
                                        </View>
                                ),
                        },
                        {}
                );
        }, [LanguageOption, showScrollViewModal, translate]);

        return { openLanguageModal };
};
