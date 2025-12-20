import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useMyScrollViewModal } from '@/components/GlobalModal/useMyScrollViewModal';
import ProjectButton from '@/components/ProjectButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { TranslationKeys } from '@/locales/keys';
import useLogout from './useLogout';
import useLogoutButtonTranslation from './useLogoutButtonTranslation';

const useConfirmLogoutModal = () => {
        const { show, close } = useMyScrollViewModal();
        const logout = useLogout();
        const { translate } = useLanguage();
        const { theme } = useTheme();
        const { buttonLabel, modalDescription } = useLogoutButtonTranslation();

        const openConfirmLogoutModal = useCallback(
                (asGuest: boolean = false) => {
                        const handleLogout = async () => {
                                close();
                                await logout(asGuest);
                        };

                        show(
                                {
                                        children: (
                                                <View style={{ gap: 12 }}>
                                                        <Text
                                                                style={{
                                                                        fontSize: 18,
                                                                        fontWeight: '600',
                                                                        color: theme.screen.text,
                                                                }}
                                                        >
                                                                {buttonLabel}
                                                        </Text>
                                                        <Text style={{ color: theme.screen.text }}>
                                                                {modalDescription}
                                                        </Text>
                                                        <ProjectButton
                                                                text={translate(TranslationKeys.confirm)}
                                                                onPress={handleLogout}
                                                                style={{ marginVertical: 0 }}
                                                        />
                                                        <TouchableOpacity onPress={close} style={{ alignSelf: 'center', paddingVertical: 6 }}>
                                                                <Text style={{ color: theme.screen.text }}>
                                                                        {translate(TranslationKeys.cancel)}
                                                                </Text>
                                                        </TouchableOpacity>
                                                </View>
                                        ),
                                },
                                { backgroundStyle: { backgroundColor: theme.sheet.sheetBg }, headerBackgroundColor: theme.sheet.sheetBg }
                        );
                },
                [buttonLabel, close, logout, modalDescription, show, theme.screen.text, theme.sheet.sheetBg, translate]
        );

        return { openConfirmLogoutModal, closeConfirmLogoutModal: close };
};

export default useConfirmLogoutModal;
