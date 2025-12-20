import React, {useCallback} from 'react';
import ForecastSheet from '@/components/ForecastSheet/ForecastSheet';
import {useMyScrollViewModal} from '@/components/GlobalModal/useMyScrollViewModal';
import {useLanguage} from '@/hooks/useLanguage';
import {useTheme} from '@/hooks/useTheme';
import {TranslationKeys} from '@/locales/keys';
import {DatabaseTypes} from 'repo-depkit-common';

export const useUtilizationModal = () => {
        const {show: showScrollViewModal, close: closeScrollViewModal} = useMyScrollViewModal();
        const {theme} = useTheme();
        const {translate} = useLanguage();

        const openUtilizationModal = useCallback(
                (forDate: string, canteen: DatabaseTypes.Canteens | null) =>
                        showScrollViewModal(
                                {
                                        title: translate(TranslationKeys.forecast),
                                        onClose: closeScrollViewModal,
                                        children: (
                                                <ForecastSheet
                                                        forDate={forDate}
                                                        canteen={canteen}
                                                />
                                        ),
                                },
                                {backgroundStyle: {backgroundColor: theme.sheet.sheetBg}, headerBackgroundColor: theme.sheet.sheetBg}
                        ),
                [closeScrollViewModal, showScrollViewModal, theme.sheet.sheetBg, translate]
        );

        return {openUtilizationModal};
};

export default useUtilizationModal;
