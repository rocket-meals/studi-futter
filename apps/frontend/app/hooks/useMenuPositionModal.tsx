import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useMyScrollViewModal } from '@/components/GlobalModal/useMyScrollViewModal';
import SettingsList from '@/components/SettingsList';
import CollectibleSpot from '@/components/CollectibleItem/CollectibleSpot';
import { drawers } from '@/constants/SettingData';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { TranslationKeys } from '@/locales/keys';
import { RootState } from '@/redux/reducer';
import { SET_DRAWER_POSITION } from '@/redux/Types/types';
import { CollectibleAt } from 'repo-depkit-common';

const MenuPositionSheet: React.FC<{ closeSheet: () => void }> = ({ closeSheet }) => {
	const { theme } = useTheme();
	const { translate } = useLanguage();
	const dispatch = useDispatch();
	const { drawerPosition, primaryColor } = useSelector((state: RootState) => state.settings);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);

	const updatePosition = (position: string) => {
		setSelectedOption(position);
		dispatch({ type: SET_DRAWER_POSITION, payload: position });
		closeSheet();
	};

	useEffect(() => {
		setSelectedOption(drawerPosition);
	}, [drawerPosition]);

	return (
		<View style={{ width: '100%', gap: 12 }}>
			<View style={{ width: '100%', paddingHorizontal: 10, marginTop: 12 }}>
				{drawers.map((drawer, index) => {
					const isSelected = selectedOption === drawer.id;
					const groupPosition =
						drawers.length === 1
							? 'single'
							: index === 0
								? 'top'
								: index === drawers.length - 1
									? 'bottom'
									: 'middle';

					return (
						<SettingsList
							key={drawer.id}
							label={translate(drawer.name)}
							leftIcon={<MaterialCommunityIcons name={drawer.icon} size={24} />}
							iconBgColor={primaryColor}
							groupPosition={groupPosition}
							showSeparator={index !== drawers.length - 1}
							rightIcon={
								<MaterialCommunityIcons
									name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
									size={24}
									color={isSelected ? primaryColor : theme.screen.icon}
								/>
							}
							handleFunction={() => updatePosition(drawer.id)}
						/>
					);
				})}
			</View>
			<CollectibleSpot collectibleKey={CollectibleAt.collectible_at_settings_menuposition} />
		</View>
	);
};

export const useMenuPositionModal = () => {
	const { show: showScrollViewModal, close: closeScrollViewModal } = useMyScrollViewModal();
	const { translate } = useLanguage();

	const openMenuPositionModal = useCallback(() => {
		showScrollViewModal({
			title: translate(TranslationKeys.drawer_config_position),
			onClose: closeScrollViewModal,
			children: <MenuPositionSheet closeSheet={closeScrollViewModal} />,
		});
	}, [closeScrollViewModal, showScrollViewModal, translate]);

	return { openMenuPositionModal };
};

export default useMenuPositionModal;
