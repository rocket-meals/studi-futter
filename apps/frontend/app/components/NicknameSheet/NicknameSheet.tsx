import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View, Keyboard } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import { useSelector } from 'react-redux';
import styles from './styles';
import { NicknameSheetProps } from './types';
import { TranslationKeys } from '@/locales/keys';
import { RootState } from '@/redux/reducer';
import { myContrastColor } from '@/helper/ColorHelper';

const NicknameSheet: React.FC<NicknameSheetProps> = ({ closeSheet, initialValue, onSave }) => {
        const { theme } = useTheme();
        const { translate } = useLanguage();
        const { primaryColor, selectedTheme: mode } = useSelector((state: RootState) => state.settings);
        const contrastColor = myContrastColor(primaryColor, theme, mode === 'dark');

        const [value, setValue] = useState(initialValue ?? '');

        useEffect(() => {
                setValue(initialValue ?? '');
        }, [initialValue]);

        const trimmedValue = useMemo(() => value?.trim?.() ?? '', [value]);

        const disableSave = useMemo(() => trimmedValue === (initialValue?.trim?.() ?? ''), [initialValue, trimmedValue]);

        const Content = (
                <View
                        style={{
                                ...styles.sheetView,
				backgroundColor: theme.sheet.sheetBg,
			}}
		>
                        <TextInput
                                style={{
                                        ...styles.sheetInput,
					color: theme.sheet.text,
					backgroundColor: theme.sheet.inputBg,
					borderColor: theme.sheet.inputBorder,
				}}
                                placeholder={translate(TranslationKeys.nickname)}
                                placeholderTextColor={theme.sheet.placeholder}
                                cursorColor={theme.sheet.text}
                                selectionColor={primaryColor}
                                value={value}
                                onChangeText={setValue}
                        />

                        <View style={styles.buttonContainer}>
				<TouchableOpacity
					onPress={() => {
						Keyboard.dismiss();
						closeSheet();
					}}
					style={{
						...styles.cancelButton,
						borderColor: primaryColor,
					}}
				>
					<Text style={[styles.buttonText, { color: theme.screen.text }]}>{translate(TranslationKeys.cancel)}</Text>
				</TouchableOpacity>

                                <TouchableOpacity
                                        onPress={() => {
                                                Keyboard.dismiss();
                                                onSave(trimmedValue);
                                        }}
					disabled={disableSave}
                                        style={{
                                                ...styles.saveButton,
                                                backgroundColor: primaryColor,
                                                opacity: disableSave ? 0.5 : 1,
                                        }}
                                >
                                        <Text style={[styles.buttonText, { color: contrastColor }]}>{translate(TranslationKeys.save)}</Text>
                                </TouchableOpacity>
                        </View>
                </View>
        );

        if (Platform.OS === 'web') {
                return Content;
        }

        return (
                <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'position' : undefined}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
                        style={styles.keyboardAvoidingView}
                >
                        <View style={styles.keyboardAvoidingContent}>{Content}</View>
                </KeyboardAvoidingView>
        );
};

export default NicknameSheet;
