import React, { useCallback } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View, Keyboard } from 'react-native';
import { useSelector } from 'react-redux';

import { SettingsListInputProps } from './types';
import styles from './styles';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/redux/reducer';
import { myContrastColor } from '@/helper/ColorHelper';

const SettingsListInput: React.FC<SettingsListInputProps> = ({
        placeholder,
        value,
        onChangeText,
        onSave,
        saveLabel,
        disableSave = false,
        autoFocus = true,
        keyboardType,
        multiline = false,
        numberOfLines,
        textAlignVertical,
        inputStyle,
        allowSubmitWhenDisabled = false,
}) => {
        const { theme } = useTheme();
        const { primaryColor, selectedTheme: mode } = useSelector((state: RootState) => state.settings);
        const contrastColor = myContrastColor(primaryColor, theme, mode === 'dark');
        const handleSubmitEditing = useCallback(() => {
                if (multiline) return;
                if (disableSave && !allowSubmitWhenDisabled) return;
                Keyboard.dismiss();
                onSave();
        }, [allowSubmitWhenDisabled, disableSave, multiline, onSave]);

        const Content = (
                <View
                        style={{
                                ...styles.sheetView,
                        }}
                >
                        <TextInput
                                style={{
                                        ...styles.sheetInput,
                                        color: theme.sheet.text,
                                        backgroundColor: theme.sheet.inputBg,
                                        borderColor: theme.sheet.inputBorder,
                                        ...(inputStyle ?? {}),
                                }}
                                autoFocus={autoFocus}
                                placeholder={placeholder}
                                placeholderTextColor={theme.sheet.placeholder}
                                cursorColor={theme.sheet.text}
                                selectionColor={primaryColor}
                                value={value}
                                onChangeText={onChangeText}
                                keyboardType={keyboardType}
                                multiline={multiline}
                                numberOfLines={numberOfLines}
                                textAlignVertical={textAlignVertical}
                                blurOnSubmit={!multiline}
                                returnKeyType={multiline ? 'default' : 'done'}
                                onSubmitEditing={handleSubmitEditing}
                        />

                        <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                        onPress={() => {
                                                Keyboard.dismiss();
                                                onSave();
                                        }}
                                        disabled={disableSave}
                                        style={{
                                                ...styles.saveButton,
                                                backgroundColor: primaryColor,
                                                opacity: disableSave ? 0.5 : 1,
                                        }}
                                >
                                        <Text style={[styles.buttonText, { color: contrastColor }]}>{saveLabel}</Text>
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

export default SettingsListInput;
