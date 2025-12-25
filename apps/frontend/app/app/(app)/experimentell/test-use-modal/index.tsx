import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import { TranslationKeys } from '@/locales/keys';
import useSetPageTitle from '@/hooks/useSetPageTitle';
import { useMyScrollViewModal } from '@/components/GlobalModal/useMyScrollViewModal';
import styles from './styles';

const TestUseModalScreen = () => {
        useSetPageTitle(TranslationKeys.test_use_modal);
        const { theme } = useTheme();
        const { translate } = useLanguage();
        const { show, close, debug } = useMyScrollViewModal();

        const openExampleModal = () => {
                show(
                        {
                                title: translate(TranslationKeys.test_use_modal),
                                showsVerticalScrollIndicator: false,
                                children: (
                                        <View
                                                style={[
                                                        styles.modalContent,
                                                        {
                                                                backgroundColor: theme.sheet?.sheetBg || theme.screen.iconBg,
                                                                borderColor: theme.screen.iconBg,
                                                        },
                                                ]}
                                        >
                                                <Text style={[styles.modalTitle, { color: theme.screen.text }]}>
                                                        {translate(TranslationKeys.test_use_modal)}
                                                </Text>
                                                <Text style={[styles.modalBody, { color: theme.screen.text }]}>
                                                        {translate(TranslationKeys.modal_example_body)}
                                                </Text>
                                                <TouchableOpacity
                                                        style={[
                                                                styles.modalButton,
                                                                {
                                                                        backgroundColor: theme.button?.background || theme.screen.iconBg,
                                                                },
                                                        ]}
                                                        onPress={close}
                                                >
                                                        <Text
                                                                style={[
                                                                        styles.modalButtonText,
                                                                        { color: theme.button?.text || theme.screen.text },
                                                                ]}
                                                        >
                                                                {translate(TranslationKeys.close_modal)}
                                                        </Text>
                                                </TouchableOpacity>
                                        </View>
                                ),
                        },
                        {}
                );
        };

        return (
                <ScrollView
                        style={{ ...styles.container, backgroundColor: theme.screen.background }}
                        contentContainerStyle={{ ...styles.contentContainer, backgroundColor: theme.screen.background }}
                >
                        <View style={styles.content}>
                                <Text style={[styles.heading, { color: theme.screen.text }]}>
                                        {translate(TranslationKeys.test_use_modal)}
                                </Text>
                                <Text style={[styles.description, { color: theme.screen.text }]}>
                                        {translate(TranslationKeys.modal_example_body)}
                                </Text>
                                <TouchableOpacity
                                        style={[
                                                styles.button,
                                                { backgroundColor: theme.button?.background || theme.screen.iconBg },
                                        ]}
                                        onPress={openExampleModal}
                                >
                                        <Text style={[styles.buttonText, { color: theme.button?.text || theme.screen.text }]}>
                                                {translate(TranslationKeys.open_modal_example)}
                                        </Text>
                                </TouchableOpacity>
                                <View style={[styles.debugCard, { backgroundColor: theme.screen.iconBg }]}>
                                        <Text style={[styles.debugTitle, { color: theme.screen.text }]}>useModal debug</Text>
                                        <Text selectable style={[styles.debugText, { color: theme.screen.text }]}>
                                                {JSON.stringify(debug, null, 2)}
                                        </Text>
                                </View>
                        </View>
                </ScrollView>
        );
};

export default TestUseModalScreen;
