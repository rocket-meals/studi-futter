import { KeyboardTypeOptions } from 'react-native';

export interface SettingsListInputProps {
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
