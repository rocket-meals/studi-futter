import { ReactNode } from 'react';
import MyScrollViewModal, { MyScrollViewModalProps } from '@/components/MyScrollViewModal';
import { useModal } from './useModal';
import { useTheme } from '@/hooks/useTheme';
import {View} from "react-native";
import React from 'react';

export type MyScrollViewModalConfig = Omit<MyScrollViewModalProps, 'closeSheet'> & { children?: ReactNode };

export const useMyScrollViewModal = () => {
        const { show: showModal, close, debug } = useModal();
        const { theme } = useTheme();

        const show = (modalProps: MyScrollViewModalConfig, options?: { backgroundStyle?: any; headerBackgroundColor?: string }) => {
                const { children, backgroundColor, ...restProps } = modalProps;

                const resolvedBackgroundColor = backgroundColor ?? theme.screen.background;
                const backgroundStyle = { backgroundColor: resolvedBackgroundColor, ...options?.backgroundStyle };

                const mergedOptions = {
                        ...options,
                        backgroundStyle,
                        headerBackgroundColor: resolvedBackgroundColor,
                };

                showModal(
                        <MyScrollViewModal closeSheet={close} backgroundColor={resolvedBackgroundColor} {...restProps}>
                                {children}
                        </MyScrollViewModal>,
                        mergedOptions,
                );
        };

        return { show, close, debug };
};
