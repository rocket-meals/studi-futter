import React, { useCallback } from 'react';

import SortSheet from '@/components/SortSheet/SortSheet';
import { useMyScrollViewModal } from '@/components/GlobalModal/useMyScrollViewModal';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { TranslationKeys } from '@/locales/keys';

export const useFoodofferSortingModal = () => {
        const { show: showScrollViewModal, close: closeScrollViewModal } = useMyScrollViewModal();
        const { translate } = useLanguage();
        const { theme } = useTheme();

        const openFoodofferSortingModal = useCallback(() => {
                showScrollViewModal(
                        {
                                title: translate(TranslationKeys.sort),
                                onClose: closeScrollViewModal,
                                children: <SortSheet closeSheet={closeScrollViewModal} />,
                        },
                        { backgroundStyle: { backgroundColor: theme.sheet.sheetBg }, headerBackgroundColor: theme.sheet.sheetBg }
                );
        }, [closeScrollViewModal, showScrollViewModal, theme.sheet.sheetBg, translate]);

        return { openFoodofferSortingModal };
};

export default useFoodofferSortingModal;
