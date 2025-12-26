import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useMyScrollViewModal } from '@/components/GlobalModal/useMyScrollViewModal';
import SettingsList from '@/components/SettingsList';
import CollectibleSpot from '@/components/CollectibleItem/CollectibleSpot';
import { days } from '@/constants/SettingData';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { TranslationKeys } from '@/locales/keys';
import { RootState } from '@/redux/reducer';
import { SET_FIRST_DAY_OF_THE_WEEK } from '@/redux/Types/types';
import { CollectibleAt } from 'repo-depkit-common';

const FirstDayOfWeekSheet: React.FC<{ closeSheet: () => void }> = ({ closeSheet }) => {
	const { theme } = useTheme();
	const { translate } = useLanguage();
	const dispatch = useDispatch();
	const { firstDayOfTheWeek, primaryColor } = useSelector((state: RootState) => state.settings);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);

	const updateFirstDay = (day: { id: string; name: string }) => {
		setSelectedOption(day.name);
		dispatch({ type: SET_FIRST_DAY_OF_THE_WEEK, payload: day });
		closeSheet();
	};

	useEffect(() => {
		setSelectedOption(firstDayOfTheWeek?.name);
	}, [firstDayOfTheWeek]);

	return (
		<View style={{ width: '100%', gap: 12 }}>
			<View style={{ width: '100%', paddingHorizontal: 10, marginTop: 12 }}>
				{days.map((day, index) => {
					const isSelected = selectedOption === day.name;
					const groupPosition =
						days.length === 1
							? 'single'
							: index === 0
								? 'top'
								: index === days.length - 1
									? 'bottom'
									: 'middle';

					return (
						<SettingsList
							key={day.id}
							label={translate(day.name)}
							noIconIndent
							groupPosition={groupPosition}
							showSeparator={index !== days.length - 1}
							rightIcon={
								<MaterialCommunityIcons
									name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
									size={24}
									color={isSelected ? primaryColor : theme.screen.icon}
								/>
							}
							handleFunction={() => updateFirstDay({ id: day.id, name: day.name })}
						/>
					);
				})}
			</View>
			<CollectibleSpot collectibleKey={CollectibleAt.collectible_at_settings_first_day_of_week} />
		</View>
	);
};

export const useFirstDayOfWeekModal = () => {
	const { show: showScrollViewModal, close: closeScrollViewModal } = useMyScrollViewModal();
	const { translate } = useLanguage();

	const openFirstDayOfWeekModal = useCallback(() => {
		showScrollViewModal({
			title: translate(TranslationKeys.first_day_of_week),
			onClose: closeScrollViewModal,
			children: <FirstDayOfWeekSheet closeSheet={closeScrollViewModal} />,
		});
	}, [closeScrollViewModal, showScrollViewModal, translate]);

	return { openFirstDayOfWeekModal };
};

export default useFirstDayOfWeekModal;
