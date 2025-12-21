import React, { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';

import { useMyScrollViewModal } from '@/components/GlobalModal/useMyScrollViewModal';
import ServerOption from '@/components/ServerOption/ServerOption';
import { CustomerConfig, getCustomerConfigurations, getCustomerEnumForConfig } from '@/config';
import { TranslationKeys } from '@/locales/keys';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';

type CustomerConfigModalProps = {
        selectedServer: string;
        onSelect: (config: CustomerConfig) => void;
};

const useCustomerConfigModal = () => {
        const { show, close } = useMyScrollViewModal();
        const { translate } = useLanguage();
        const { theme } = useTheme();

        const servers = useMemo(() => getCustomerConfigurations(), []);

        const getDisplayName = useCallback(
                (config: CustomerConfig) => config.projectName || getCustomerEnumForConfig(config) || '',
                []
        );

        const openCustomerConfigModal = useCallback(
                ({ selectedServer, onSelect }: CustomerConfigModalProps) => {
                        show({
                                children: (
                                        <View style={{ gap: 16 }}>
                                                <Text
                                                        style={{
                                                                fontSize: 18,
                                                                fontWeight: '600',
                                                                color: theme.sheet.text,
                                                        }}
                                                >
                                                        {translate(TranslationKeys.backend_server)}
                                                </Text>
                                                <View style={{ gap: 10 }}>
                                                        {servers.map(srv => (
                                                                <ServerOption
                                                                        key={srv.projectSlug}
                                                                        server={srv}
                                                                        label={getDisplayName(srv)}
                                                                        isSelected={selectedServer === srv.server_url}
                                                                        onPress={() => {
                                                                                onSelect(srv);
                                                                                close();
                                                                        }}
                                                                />
                                                        ))}
                                                </View>
                                        </View>
                                ),
                        });
                },
                [close, getDisplayName, servers, show, theme.sheet.text, translate]
        );

        return { openCustomerConfigModal, closeCustomerConfigModal: close };
};

export default useCustomerConfigModal;
