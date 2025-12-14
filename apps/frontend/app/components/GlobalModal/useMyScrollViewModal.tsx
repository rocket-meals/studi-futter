import { ReactNode } from 'react';
import MyScrollViewModal, { MyScrollViewModalProps } from '@/components/MyScrollViewModal';
import { useModal } from './useModal';
import { useTheme } from '@/hooks/useTheme';

export type MyScrollViewModalConfig = Omit<MyScrollViewModalProps, 'closeSheet'> & { children?: ReactNode };

export const useMyScrollViewModal = () => {
        const { show: showModal, close, debug } = useModal();
        const { theme } = useTheme();

        const show = (modalProps: MyScrollViewModalConfig, options?: { backgroundStyle?: any; headerBackgroundColor?: string }) => {
                const { children, ...restProps } = modalProps;

                const backgroundStyle = { backgroundColor: theme.screen.background };
                const mergedOptions = {
                        ...options,
                        backgroundStyle,
                };

                const backgroundColor = theme.screen.background;

                showModal(
                        <MyScrollViewModal closeSheet={close} backgroundColor={backgroundColor} {...restProps}>
                                {children}
                        </MyScrollViewModal>,
                        mergedOptions,
                );
        };

        return { show, close, debug };
};
