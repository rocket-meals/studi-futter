import React, { useCallback, useEffect, useMemo, useState } from 'react';

import SettingsListInput from '@/components/SettingsListInput';
import { useLanguage } from '@/hooks/useLanguage';
import { TranslationKeys } from '@/locales/keys';

import { SettingsListNicknameProps } from './types';

const SettingsListNickname: React.FC<SettingsListNicknameProps> = ({ initialValue, onSave }) => {
        const { translate } = useLanguage();
        const [value, setValue] = useState(initialValue ?? '');

        useEffect(() => {
                setValue(initialValue ?? '');
        }, [initialValue]);

        const trimmedValue = useMemo(() => value?.trim?.() ?? '', [value]);

        const disableSave = useMemo(
                () => trimmedValue === (initialValue?.trim?.() ?? ''),
                [initialValue, trimmedValue]
        );

        const handleSave = useCallback(() => onSave(trimmedValue), [onSave, trimmedValue]);

        return (
                <SettingsListInput
                        placeholder={translate(TranslationKeys.nickname)}
                        value={value}
                        onChangeText={setValue}
                        onSave={handleSave}
                        saveLabel={translate(TranslationKeys.save)}
                        disableSave={disableSave}
                />
        );
};

export default SettingsListNickname;
