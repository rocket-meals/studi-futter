import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import { useMyScrollViewModal } from '@/components/GlobalModal/useMyScrollViewModal';
import SettingsList from '@/components/SettingsList';
import { CustomerConfig, getCustomerConfigurations, getCustomerEnumForConfig } from '@/config';
import { TranslationKeys } from '@/locales/keys';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/redux/reducer';

type CustomerConfigModalProps = {
        selectedServer: string;
        onSelect: (config: CustomerConfig) => void;
};

const useCustomerConfigModal = () => {
        const { show, close } = useMyScrollViewModal();
        const { translate } = useLanguage();
        const { theme } = useTheme();
        const { primaryColor } = useSelector((state: RootState) => state.settings);

        const servers = useMemo(() => getCustomerConfigurations(), []);

        const getDisplayName = useCallback(
                (config: CustomerConfig) => config.projectName || getCustomerEnumForConfig(config) || '',
                []
        );

        const openCustomerConfigModal = useCallback(
                ({ selectedServer, onSelect }: CustomerConfigModalProps) => {
                        show({
                                title: translate(TranslationKeys.backend_server),
                                onClose: close,
                                children: (
                                        <View style={{ width: '100%' }}>
                                                {servers.map((srv, index) => {
                                                        const isSelected = selectedServer === srv.server_url;
                                                        const groupPosition =
                                                                servers.length === 1
                                                                        ? 'single'
                                                                        : index === 0
                                                                                ? 'top'
                                                                                : index === servers.length - 1
                                                                                        ? 'bottom'
                                                                                        : 'middle';

                                                        return (
                                                                <SettingsList
                                                                        key={srv.projectSlug}
                                                                        label={getDisplayName(srv)}
                                                                        leftIcon={<MaterialCommunityIcons name="server" size={24} />}
                                                                        iconBgColor={primaryColor}
                                                                        groupPosition={groupPosition}
                                                                        showSeparator={index !== servers.length - 1}
                                                                        rightIcon={
                                                                                <MaterialCommunityIcons
                                                                                        name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                                                                                        size={24}
                                                                                        color={isSelected ? primaryColor : theme.screen.icon}
                                                                                />
                                                                        }
                                                                        handleFunction={() => {
                                                                                onSelect(srv);
                                                                                close();
                                                                        }}
                                                                />
                                                        );
                                                })}
                                        </View>
                                ),
                        });
                },
                [close, getDisplayName, primaryColor, servers, show, theme.screen.icon, translate]
        );

        return { openCustomerConfigModal, closeCustomerConfigModal: close };
};

export default useCustomerConfigModal;
