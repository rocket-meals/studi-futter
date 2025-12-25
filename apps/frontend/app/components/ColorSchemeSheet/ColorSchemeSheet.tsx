import React from 'react';
import { Text, View } from 'react-native';
import styles from './styles';
import { ColorSchemeSheetProps } from './types';
import { themes } from '@/constants/SettingData';
import CollectibleSpot from "@/components/CollectibleItem/CollectibleSpot";
import { CollectibleAt } from 'repo-depkit-common';
import SettingsList from '@/components/SettingsList';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducer';
import DebugView from '@/components/DebugView';

const ColorSchemeSheet: React.FC<ColorSchemeSheetProps> = ({ closeSheet, selectedTheme, onSelect }) => {
	const { translate } = useLanguage();
	const { theme } = useTheme();
	const { primaryColor, selectedTheme: selectedThemeFromStore } = useSelector((state: RootState) => state.settings);
	const activeSelectedTheme = selectedThemeFromStore ?? selectedTheme;

	return (
		<View style={styles.sheetView}>
			<View style={styles.optionsContainer}>
				{themes.map((themeOption, index) => {
					const isSelected = activeSelectedTheme === themeOption.id;
					const groupPosition =
						themes.length === 1
							? 'single'
							: index === 0
								? 'top'
								: index === themes.length - 1
									? 'bottom'
									: 'middle';

					return (
						<SettingsList
							key={themeOption.id}
							label={translate(themeOption.name)}
							leftIcon={<MaterialCommunityIcons name={themeOption.icon as any} size={24} />}
							iconBgColor={primaryColor}
							groupPosition={groupPosition}
							showSeparator={index !== themes.length - 1}
							rightIcon={
								<MaterialCommunityIcons
									name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
									size={24}
									color={isSelected ? primaryColor : theme.screen.icon}
								/>
							}
							handleFunction={() => {
								onSelect(themeOption.id);
								closeSheet();
							}}
						/>
					);
				})}
			</View>
			<CollectibleSpot collectibleKey={CollectibleAt.collectible_at_settings_theme} />
			<DebugView title="Theme" isVisible>
				<View style={styles.debugContainer}>
					<Text style={[styles.debugLabel, { color: theme.screen.text }]}>
						theme.screen.background: {theme.screen.background}
					</Text>
					<View style={[styles.debugSwatch, { backgroundColor: theme.screen.background }]} />
				</View>
			</DebugView>
		</View>
	);
};

export default ColorSchemeSheet;
