import React, { memo, useMemo, useCallback } from 'react';
import { Dimensions, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { isWeb } from '@/constants/Constants';
import { excerpt, getImageUrl } from '@/constants/HelperFunctions';
import { useTheme } from '@/hooks/useTheme';
import { myContrastColor } from '@/helper/ColorHelper';
import styles from './styles';
import { router } from 'expo-router';
import { getDistanceUnit } from '@/helper/distanceHelper';
import { Tooltip, TooltipContent, TooltipText } from '@gluestack-ui/themed';
import { useLanguage } from '@/hooks/useLanguage';
import { TranslationKeys } from '@/locales/keys';
import CardWithText from '../CardWithText/CardWithText';
import CardDimensionHelper from '@/helper/CardDimensionHelper';


export interface BuildingItemPropsOptimized {
	campus: any;
	onEditImage?: (campus: any) => void;
	openDistanceSheet: () => void;
	settings: {
		amountColumnsForcard: number;
		primaryColor?: string;
		serverInfo?: any;
		appSettings?: any;
		selectedTheme?: string;
		screenWidth: number;
		isManagement?: boolean;
	};
}

const BuildingItem: React.FC<BuildingItemPropsOptimized> = ({ campus, onEditImage, openDistanceSheet, settings }) => {
	const { theme } = useTheme();
	const { translate } = useLanguage();

	const { amountColumnsForcard, primaryColor, serverInfo, appSettings, selectedTheme: mode, screenWidth, isManagement = false } = settings;

	const defaultImage = useMemo(() => getImageUrl(serverInfo?.info?.project?.project_logo), [serverInfo]);
	const campus_area_color = appSettings?.campus_area_color ? appSettings?.campus_area_color : primaryColor;
	const contrastColor = myContrastColor(campus_area_color, theme, mode === 'dark');

	const handleNavigation = useCallback(
		(id: string) =>
			router.push({
				pathname: '/(app)/campus/details',
				params: { id },
			}),
		[]
	);

	const cardWidth = useMemo(() => {
		return amountColumnsForcard === 0 ? CardDimensionHelper.getCardDimension(screenWidth) : CardDimensionHelper.getCardWidth(screenWidth, amountColumnsForcard);
	}, [amountColumnsForcard, screenWidth]);

	const imageSource = useMemo(() => {
		if (campus?.image || campus?.image_remote_url) {
			return { uri: campus?.image_remote_url || getImageUrl(campus?.image) };
		}
		return { uri: defaultImage };
	}, [campus, defaultImage]);

	const cardSize =
		amountColumnsForcard === 0
		  ? CardDimensionHelper.getCardDimension(screenWidth)
		  : CardDimensionHelper.getCardWidth(screenWidth, amountColumnsForcard);

	return (
		<Tooltip
			placement="top"
			trigger={triggerProps => (
				<CardWithText
					{...triggerProps}
					onPress={() => handleNavigation(campus?.id)}
					imageSource={imageSource}
					containerStyle={{
						width: '100%',
						backgroundColor: theme.card.background,
						flex: 1,
					}}
					imageContainerStyle={{
						height: cardSize,
					}}
					contentStyle={{
						paddingHorizontal: 5,
						flex: 1,
						justifyContent: 'center'
					}}
					borderColor={campus_area_color}
					imageChildren={
						<View style={styles.imageActionContainer}>
							{isManagement ? (
								<TouchableOpacity
									style={styles.editImageButton}
									onPress={() => {
										onEditImage?.(campus);
									}}
								>
									<View />
								</TouchableOpacity>
							) : (
								<View />
							)}

							<TouchableOpacity
								style={{
									...styles.directionButton,
									backgroundColor: campus_area_color,
								}}
								onPress={openDistanceSheet}
							>
								<MaterialCommunityIcons name="map-marker-distance" size={20} color={contrastColor} />
								<Text style={{ ...styles.distance, color: contrastColor }}>{getDistanceUnit(campus?.distance)}</Text>
							</TouchableOpacity>
						</View>
					}
				>
					<Text style={{ ...styles.campusName, color: theme.screen.text }}>{isWeb ? excerpt(campus?.alias, 70) : excerpt(campus?.alias, 40)}</Text>
				</CardWithText>
			)}
		>
			<TooltipContent bg={theme.tooltip.background} py="$1" px="$2">
				<TooltipText fontSize="$sm" color={theme.tooltip.text}>
					{`${translate(TranslationKeys.edit)}: ${translate(TranslationKeys.image)}`}
				</TooltipText>
			</TooltipContent>
		</Tooltip>
	);
};

function areEqual(prev: BuildingItemPropsOptimized, next: BuildingItemPropsOptimized) {
	const p = prev.campus;
	const n = next.campus;

	if (String(p?.id ?? '') !== String(n?.id ?? '')) return false;
	if (String(p?.alias ?? '') !== String(n?.alias ?? '')) return false;
	const pImg = String(p?.image_remote_url ?? p?.image ?? '');
	const nImg = String(n?.image_remote_url ?? n?.image ?? '');
	if (pImg !== nImg) return false;
	if (Number(p?.distance ?? 0) !== Number(n?.distance ?? 0)) return false;

	if (prev.settings.amountColumnsForcard !== next.settings.amountColumnsForcard) return false;
	if (prev.settings.screenWidth !== next.settings.screenWidth) return false;

	return true;
}

export default memo(BuildingItem, areEqual);

const localStyles = StyleSheet.create({
	placeholder: {
		width: 1,
		height: 1,
		opacity: 0,
	},
});
