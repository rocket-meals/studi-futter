import React from 'react';
import { Text, View } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import { languages } from '@/constants/SettingData';
import { isWeb } from '@/constants/Constants';
import styles from './styles';
import { LanguageSheetProps } from './types';
import { TranslationKeys } from '@/locales/keys';
import SettingsList from '@/components/SettingsList';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducer';
import MyImage from '@/components/MyImage';

const LanguageSheet: React.FC<LanguageSheetProps> = ({ closeSheet, selectedLanguage, onSelect }) => {
        const { theme } = useTheme();
        const { translate } = useLanguage();
        const { primaryColor } = useSelector((state: RootState) => state.settings);

        return (
                <BottomSheetScrollView style={{ ...styles.sheetView, backgroundColor: theme.sheet.sheetBg }} contentContainerStyle={styles.contentContainer}>
                        <View
                                style={{
                                        ...styles.sheetHeader,
                                        paddingRight: isWeb ? 10 : 0,
                                        paddingTop: isWeb ? 10 : 0,
                                }}
                        >
                                <View />
                                <Text
                                        style={{
                                                ...styles.sheetHeading,
                                                fontSize: isWeb ? 40 : 28,
                                                color: theme.sheet.text,
                                        }}
                                >
                                        {translate(TranslationKeys.language)}
                                </Text>
                        </View>
                        <View style={styles.optionsContainer}>
                                {languages.map((language, index) => {
                                        const isSelected = selectedLanguage === language.value;
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
                                                        key={language.value}
                                                        label={language.label}
                                                        iconBgColor="transparent"
                                                        leftIcon={<MyImage source={language.flag} style={styles.flagIcon} />}
                                                        groupPosition={groupPosition}
                                                        showSeparator={index !== languages.length - 1}
                                                        rightIcon={
                                                                <MaterialCommunityIcons
                                                                        name={isSelected ? 'circle' : 'circle-outline'}
                                                                        size={24}
                                                                        color={isSelected ? primaryColor : theme.screen.icon}
                                                                />
                                                        }
                                                        handleFunction={() => {
                                                                onSelect(language.value);
                                                                closeSheet();
                                                        }}
                                                />
                                        );
                                })}
                        </View>
                </BottomSheetScrollView>
        );
};

export default LanguageSheet;
