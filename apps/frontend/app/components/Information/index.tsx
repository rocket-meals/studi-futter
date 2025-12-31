import { Linking, Platform, Text, View } from 'react-native';
import React from 'react';
import styles from './styles';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import * as Clipboard from 'expo-clipboard';
import { Entypo, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import useToast from '@/hooks/useToast';
import { TranslationKeys } from '@/locales/keys';
import SettingsList from '@/components/SettingsList';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducer';

const Information: React.FC<any> = ({ campusDetails }) => {
	const { theme } = useTheme();
	const toast = useToast();
	const { translate } = useLanguage();
	const { appSettings, primaryColor } = useSelector((state: RootState) => state.settings);
	const campusAreaColor = appSettings?.campus_area_color ?? primaryColor;

	const coordinates = campusDetails?.coordinates?.coordinates;
	const coordinatesLabel = coordinates?.length === 2 ? coordinates.join(', ') : undefined;

	const copyCordsToClipboard = async () => {
		const coordinates = campusDetails.coordinates?.coordinates;
		const copied = await Clipboard.setStringAsync(coordinates?.join(', '));
		if (copied) {
			toast('Copied', 'success');
		}
	};

	const handleCopyUrlToClipboard = async () => {
		const googleMapsUrl = campusDetails?.url;
		const copied = await Clipboard.setStringAsync(googleMapsUrl);
		if (copied) {
			toast('Copied', 'success');
		}
	};

	const handleOpenNavigation = () => {
		const coordinates = campusDetails.coordinates?.coordinates; // [longitude, latitude]

		if (!coordinates || coordinates.length !== 2) {
			console.error('Invalid coordinates');
			return;
		}

		const [longitude, latitude] = coordinates;
		const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

		if (Platform.OS === 'web') {
			window.open(googleMapsUrl, '_blank');
		} else {
			const mapsUrl =
				Platform.OS === 'ios'
					? `maps://?q=${latitude},${longitude}` // Apple Maps
					: `geo:${latitude},${longitude}?q=${latitude},${longitude}`; // Google Maps for Android

			Linking.openURL(mapsUrl).catch(err => {
				console.error('Error opening navigation:', err);
				// Fallback to Google Maps URL
				Linking.openURL(googleMapsUrl);
			});
		}
	};

	const infoItems = [
		{
			key: 'navigation',
			label: translate(TranslationKeys.open_navitation_to_location),
			leftIcon: <Ionicons name="navigate" size={24} color={theme.screen.icon} />,
			rightIcon: <Entypo name="chevron-small-right" size={26} color={theme.screen.icon} />,
			handleFunction: handleOpenNavigation,
			value: undefined,
		},
		{
			key: 'coordinates',
			label: translate(TranslationKeys.coordinates),
			leftIcon: <Ionicons name="location-sharp" size={24} color={theme.screen.icon} />,
			rightIcon: <MaterialCommunityIcons name="content-copy" size={24} color={theme.screen.icon} />,
			handleFunction: copyCordsToClipboard,
			value: coordinatesLabel,
		},
		{
			key: 'construction',
			label: translate(TranslationKeys.year_of_construction),
			leftIcon: <MaterialIcons name="construction" size={24} color={theme.screen.icon} />,
			value: campusDetails?.date_of_construction ? String(campusDetails?.date_of_construction) : undefined,
		},
		...(campusDetails?.url
			? [
					{
						key: 'url',
						label: translate(TranslationKeys.copy_url),
						leftIcon: <MaterialCommunityIcons name="attachment" size={24} color={theme.screen.icon} />,
						rightIcon: <MaterialCommunityIcons name="content-copy" size={24} color={theme.screen.icon} />,
						handleFunction: handleCopyUrlToClipboard,
						value: undefined,
					},
				]
			: []),
	];

	return (
		<View style={styles.container}>
			<Text style={{ ...styles.heading, color: theme.screen.text }}>{translate(TranslationKeys.information)}</Text>
			<View style={{ gap: 0 }}>
				{infoItems.map((item, index) => {
					const groupPosition =
						infoItems.length === 1 ? 'single' : index === 0 ? 'top' : index === infoItems.length - 1 ? 'bottom' : 'middle';
					return (
						<SettingsList
							key={item.key}
							iconBgColor={campusAreaColor}
							leftIcon={item.leftIcon}
							label={item.label}
							value={item.value}
							rightIcon={item.rightIcon}
							handleFunction={item.handleFunction}
							groupPosition={groupPosition}
						/>
					);
				})}
			</View>
		</View>
	);
};

export default Information;
