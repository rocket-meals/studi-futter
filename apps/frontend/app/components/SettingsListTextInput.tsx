// Hinweis: Wenn neue SettingsList-Komponenten entstehen, bitte auch im Experimental-Screen hinzufügen.
import React, { useCallback, useMemo } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import SettingsList from '@/components/SettingsList';
import { useTheme } from '@/hooks/useTheme';
import useMyScrollviewTextInputModal from '@/hooks/useMyScrollviewTextInputModal';
import { RootState } from '@/redux/reducer';
import { myContrastColor } from '@/helper/ColorHelper';
import type { SettingsListProps } from '@/components/SettingsList/types';
export type CheckTextInputResult = {
	isValid: boolean;
	value: string;
};

export type CheckTextInput = (value: string) => CheckTextInputResult;

export interface SettingsListTextInputSheetProps {
	placeholder: string;
	value: string;
	onChangeText: (text: string) => void;
	onSave: () => void;
	saveLabel: string;
	disableSave?: boolean;
	autoFocus?: boolean;
	keyboardType?: KeyboardTypeOptions;
	multiline?: boolean;
	numberOfLines?: number;
	textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
	inputStyle?: object;
	allowSubmitWhenDisabled?: boolean;
}

export interface SettingsListTextInputProps extends Omit<SettingsListProps, 'onPress' | 'handleFunction'> {
	modalTitle?: string;
	placeholder: string;
	saveLabel: string;
	onSave: (value: string) => void | Promise<void>;
	initialValue?: string;
	multiline?: boolean;
	keyboardType?: KeyboardTypeOptions;
	numberOfLines?: number;
	textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
	inputStyle?: object;
	autoFocus?: boolean;
	checkTextInput?: CheckTextInput;
	allowSubmitWhenDisabled?: boolean;
}

export const SettingsListTextInputSheet: React.FC<SettingsListTextInputSheetProps> = ({
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

const SettingsListTextInput: React.FC<SettingsListTextInputProps> = ({
	modalTitle,
	placeholder,
	saveLabel,
	onSave,
	initialValue,
	multiline,
	keyboardType,
	numberOfLines,
	textAlignVertical,
	inputStyle,
	autoFocus = true,
	checkTextInput,
	allowSubmitWhenDisabled,
	rightElement,
	rightIcon,
	value,
	label,
	title,
	...props
}) => {
	const { theme } = useTheme();
	const { openTextInputModal } = useMyScrollviewTextInputModal();
	const resolvedTitle = useMemo(() => modalTitle ?? title ?? label ?? '', [label, modalTitle, title]);
	const resolvedInitialValue = initialValue ?? value ?? '';

	const resolvedRightIcon = useMemo(
		() =>
			rightElement || rightIcon
				? rightIcon
				: <MaterialCommunityIcons name="pencil" size={20} color={theme.screen.icon} />,
		[rightElement, rightIcon, theme.screen.icon]
	);

	const handleOpen = useCallback(() => {
		openTextInputModal({
			title: resolvedTitle,
			placeholder,
			saveLabel,
			onSave,
			initialValue: resolvedInitialValue,
			multiline,
			keyboardType,
			numberOfLines,
			textAlignVertical,
			inputStyle,
			autoFocus,
			checkTextInput,
			allowSubmitWhenDisabled,
		});
	}, [
		allowSubmitWhenDisabled,
		autoFocus,
		checkTextInput,
		inputStyle,
		keyboardType,
		multiline,
		numberOfLines,
		onSave,
		openTextInputModal,
		placeholder,
		resolvedInitialValue,
		resolvedTitle,
		saveLabel,
		textAlignVertical,
	]);

	return (
		<SettingsList
			{...props}
			label={label}
			title={title}
			value={value}
			rightElement={rightElement}
			rightIcon={resolvedRightIcon}
			onPress={handleOpen}
		/>
	);
};

export default SettingsListTextInput;

const styles = StyleSheet.create({
	sheetView: {
		width: '100%',
		padding: 10,
		paddingBottom: 20,
		alignItems: 'stretch',
	},
	keyboardAvoidingView: {
		flex: 1,
		width: '100%',
	},
	keyboardAvoidingContent: {
		flexGrow: 1,
		alignItems: 'center',
	},
	sheetHeader: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderTopRightRadius: 28,
		borderTopLeftRadius: 28,
	},
	sheetHeading: {
		fontFamily: 'Poppins_700Bold',
		fontSize: 28,
	},
	sheetInput: {
		width: '100%',
		height: 60,
		borderRadius: 20,
		paddingHorizontal: 20,
		borderWidth: 1,
		marginTop: 20,
		fontFamily: 'Poppins_400Regular',
		fontSize: 18,
	},
	buttonContainer: {
		width: '100%',
		marginTop: 30,
		alignItems: 'stretch',
	},
	saveButton: {
		height: 52,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 50,
		width: '100%',
	},
	buttonText: {
		fontSize: 16,
		fontFamily: 'Poppins_700Bold',
	},
});
