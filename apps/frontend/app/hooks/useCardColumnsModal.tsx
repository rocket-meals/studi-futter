import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useMyScrollViewModal } from '@/components/GlobalModal/useMyScrollViewModal';
import SettingsList from '@/components/SettingsList';
import CollectibleSpot from '@/components/CollectibleItem/CollectibleSpot';
import { AmountColumn } from '@/constants/SettingData';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { TranslationKeys } from '@/locales/keys';
import { RootState } from '@/redux/reducer';
import { SET_AMOUNT_COLUMNS_FOR_CARDS } from '@/redux/Types/types';
import { CollectibleAt } from 'repo-depkit-common';

const CardColumnsSheet: React.FC<{ closeSheet: () => void }> = ({ closeSheet }) => {
	const { theme } = useTheme();
	const { translate } = useLanguage();
	const dispatch = useDispatch();
	const { amountColumnsForcard, primaryColor } = useSelector((state: RootState) => state.settings);
	const [selectedOption, setSelectedOption] = useState<number | null>(null);

	const updateColumns = (value: number) => {
		setSelectedOption(value);
		dispatch({ type: SET_AMOUNT_COLUMNS_FOR_CARDS, payload: value });
		closeSheet();
	};

	useEffect(() => {
		setSelectedOption(amountColumnsForcard);
	}, [amountColumnsForcard]);

	return (
		<View style={{ width: '100%', gap: 12 }}>
			<View style={{ width: '100%', paddingHorizontal: 10, marginTop: 12 }}>
				{AmountColumn.map((column, index) => {
					const isSelected = selectedOption === column.id;
					const groupPosition =
						AmountColumn.length === 1
							? 'single'
							: index === 0
								? 'top'
								: index === AmountColumn.length - 1
									? 'bottom'
									: 'middle';
					const label = column.id === 0 ? translate(TranslationKeys.automatic) : column.name;

					return (
						<SettingsList
							key={column.id}
							label={label}
							noIconIndent
							groupPosition={groupPosition}
							showSeparator={index !== AmountColumn.length - 1}
							rightIcon={
								<MaterialCommunityIcons
									name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
									size={24}
									color={isSelected ? primaryColor : theme.screen.icon}
								/>
							}
							handleFunction={() => updateColumns(column.id)}
						/>
					);
				})}
			</View>
			<CollectibleSpot collectibleKey={CollectibleAt.collectible_at_settings_amount_column} />
		</View>
	);
};

export const useCardColumnsModal = () => {
	const { show: showScrollViewModal, close: closeScrollViewModal } = useMyScrollViewModal();
	const { translate } = useLanguage();

	const openCardColumnsModal = useCallback(() => {
		showScrollViewModal({
			title: translate(TranslationKeys.amount_columns_for_cards),
			onClose: closeScrollViewModal,
			children: <CardColumnsSheet closeSheet={closeScrollViewModal} />,
		});
	}, [closeScrollViewModal, showScrollViewModal, translate]);

	return { openCardColumnsModal };
};

export default useCardColumnsModal;
