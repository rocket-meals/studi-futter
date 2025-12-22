import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Keyboard, SafeAreaView, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import MyImage from '@/components/MyImage';
import { useTheme } from '@/hooks/useTheme';
import styles from './styles';
import { Languages, PriceGroupKey } from './types';
import { AntDesign, Entypo, Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons, Octicons } from '@expo/vector-icons';
import { isWeb } from '@/constants/Constants';
import SettingsList from '@/components/SettingsList';
import { useExpoUpdateChecker } from '@/components/ExpoUpdateChecker/ExpoUpdateChecker';
import SettingsGroupTitle from '@/components/SettingsGroupTitle';
import SettingsListNickname from '@/components/SettingsListNickname';
import ColorSchemeSheet from '@/components/ColorSchemeSheet/ColorSchemeSheet';
import DrawerPositionSheet from '@/components/DrawerPositionSheet/DrawerPositionSheet';
import { router, useFocusEffect } from 'expo-router';
import { ConfigCustomerEnum, getCustomerEnumForConfig, type CustomerConfig, getVersionInternalForAppsettingsScreen } from '@/config';
import { useDispatch, useSelector } from 'react-redux';
import useSelectedCanteen from '@/hooks/useSelectedCanteen';
import { useLanguage } from '@/hooks/useLanguage';
import useCustomerServerUrl from '@/hooks/useCustomerServerUrl';
import { RESET_ALL_COLLECTIBLE_EVENT_DICTS, SET_AMOUNT_COLUMNS_FOR_CARDS, SET_COLLECTIBLE_ITEM_SIZE, SET_COLLECTIBLE_RANDOM_POSITION, SET_DEBUG_MODE, SET_DRAWER_POSITION, SET_FIRST_DAY_OF_THE_WEEK, SET_FOODOFFERS_NEXT_DAY_THRESHOLD, SET_NICKNAME_LOCAL, SET_SELECTED_CUSTOMER, SET_USE_WEBP_FOR_ASSETS, UPDATE_DEVELOPER_MODE, UPDATE_MANAGEMENT, UPDATE_PROFILE } from '@/redux/Types/types';
import { performLogout } from '@/helper/logoutHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseBottomSheet from '@/components/BaseBottomSheet';
import type BottomSheet from '@gorhom/bottom-sheet';
import CanteenSelectionSheet from '@/components/CanteenSelectionSheet/CanteenSelectionSheet';
import AmountColumnSheet from '@/components/AmountColumnSheet/AmountColumnSheet';
import FirstDaySheet from '@/components/FirstDaySheet/FirstDaySheet';
import FoodOffersNextDayTimeSheet from '@/components/FoodOffersNextDayTimeSheet';
import { excerpt, formatPrice, getImageUrl, showFormatedPrice } from '@/constants/HelperFunctions';
import { ProfileHelper } from '@/redux/actions/Profile/Profile';
import { ServerAPI } from '@/redux/actions';
import { TranslationKeys } from '@/locales/keys';
import useSetPageTitle from '@/hooks/useSetPageTitle';
import { CollectibleAt, DatabaseTypes } from 'repo-depkit-common';
import { RootState } from '@/redux/reducer';
import { ServerInfoHelper } from '@/helper/ServerInfoHelper';
import { UserHelper } from '@/helper/UserHelper';
import CollectibleSpot from '@/components/CollectibleItem/CollectibleSpot';
import DebugView from '@/components/DebugView';
import DropdownInput from '@/components/DropdownInput/DropdownInput';
import { useMyScrollViewModal } from '@/components/GlobalModal/useMyScrollViewModal';
import useToast from '@/hooks/useToast';
import languageStyles from '@/components/LanguageSheet/styles';
import { languages } from '@/constants/SettingData';
import useConfirmLogoutModal from '@/hooks/useConfirmLogoutModal';
import useLogoutButtonTranslation from '@/hooks/useLogoutButtonTranslation';
import useCustomerConfig from '@/hooks/useCustomerConfig';
import useCustomerConfigModal from '@/hooks/useCustomerConfigModal';

type CollectibleItemSize = 'small' | 'medium' | 'large';

const Settings = () => {
        useSetPageTitle(TranslationKeys.settings);
        const { theme, setThemeMode } = useTheme();
        const dispatch = useDispatch();
        const toast = useToast();
        const canteenSheetRef = useRef<BottomSheet>(null);
        const [isActive, setIsActive] = useState(false);
        const { translate, setLanguageMode, language } = useLanguage();
        const drawerSheetRef = useRef<BottomSheet>(null);
        const amountColumnSheetRef = useRef<BottomSheet>(null);
        const firstDaySheetRef = useRef<BottomSheet>(null);
        const colorSchemeSheetRef = useRef<BottomSheet>(null);
        const foodOffersTimeSheetRef = useRef<BottomSheet>(null);
        const collectibleSettingsModalRef = useRef<() => void>(() => {});
        const isOpeningNestedCollectibleModal = useRef(false);
        const { show: showScrollViewModal, close: closeScrollViewModal } = useMyScrollViewModal();
        const { openConfirmLogoutModal } = useConfirmLogoutModal();
        const { manualCheck } = useExpoUpdateChecker();
        const { user, profile, termsAndPrivacyConsentAcceptedDate, isManagement, isDevMode } = useSelector((state: RootState) => state.authReducer);
        const isRegisteredUser = UserHelper.isRegisteredUser(user);
        const { buttonLabel: logoutButtonLabel } = useLogoutButtonTranslation();

        const { primaryColor, drawerPosition, selectedTheme, nickNameLocal, firstDayOfTheWeek, amountColumnsForcard, serverInfo, appSettings, useWebpForAssets, foodOffersNextDayThreshold, debugMode, collectibleItemSize, collectibleRandomPosition, selectedCustomer } = useSelector((state: RootState) => state.settings);
        const currentNickname = useMemo(
                () => (profile?.id ? profile?.nickname ?? '' : nickNameLocal ?? ''),
                [nickNameLocal, profile?.id, profile?.nickname]
        );
        const selectedCanteen = useSelectedCanteen();
        const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
        const profileHelper = useMemo(() => new ProfileHelper(), []);
        const customerConfig = useCustomerConfig();
        const { openCustomerConfigModal } = useCustomerConfigModal();

        const languageCode = language;

        const languageName = Languages[languageCode as keyof typeof Languages];

        const selectedCustomerDisplayName = useMemo(
                () => customerConfig.projectName || selectedCustomer || '',
                [customerConfig.projectName, selectedCustomer]
        );

        const foods_area_color = appSettings?.foods_area_color ? appSettings?.foods_area_color : primaryColor;

        const customerServerUrl = useCustomerServerUrl();

        const collectibleSizeOptions = useMemo(
                () => [
                        { value: 'small', label: translate(TranslationKeys.collectible_event_item_size_small) },
                        { value: 'medium', label: translate(TranslationKeys.collectible_event_item_size_medium) },
                        { value: 'large', label: translate(TranslationKeys.collectible_event_item_size_large) },
                ],
                [translate]
        );

        const collectibleSizeLabel = useMemo(
                () => collectibleSizeOptions.find(option => option.value === collectibleItemSize)?.label || '',
                [collectibleItemSize, collectibleSizeOptions]
        );

        const closeNicknameSheet = useCallback(() => {
                Keyboard.dismiss();
                closeScrollViewModal();
        }, [closeScrollViewModal]);

        const saveNickname = useCallback(
                async (value: string) => {
                        const nextNickname = value?.trim?.() ?? '';
                        if (isRegisteredUser) {
                                const result = (await profileHelper.updateProfile({
                                        ...profile,
                                        nickname: nextNickname,
                                })) as DatabaseTypes.Profiles;
                                if (result) {
                                        dispatch({
                                                type: UPDATE_PROFILE,
                                                payload: result,
                                        });
                                }
                        } else {
                                dispatch({
                                        type: SET_NICKNAME_LOCAL,
                                        payload: nextNickname,
                                });
                        }
                        closeNicknameSheet();
                },
                [closeNicknameSheet, dispatch, isRegisteredUser, profile, profileHelper]
        );

	useFocusEffect(
		useCallback(() => {
			setIsActive(true);
			return () => {
				setIsActive(false);
			};
		}, [])
	);

	useEffect(() => {
		const onChange = ({ window }: { window: any }) => {
			setWindowWidth(window.width);
		};

		const subscription = Dimensions.addEventListener('change', onChange);
		return () => {
			subscription.remove();
		};
	}, []);

        const changeLanguage = useCallback(
                (language: { label?: string; value: any }) => {
                        setLanguageMode(language.value);
                        closeScrollViewModal();
                },
                [closeScrollViewModal, setLanguageMode]
        );

        const openNicknameSheet = useCallback(() => {
                showScrollViewModal(
                        {
                                title: translate(TranslationKeys.nickname),
                                onClose: closeNicknameSheet,
                                children: (
                                        <SettingsListNickname
                                                initialValue={currentNickname}
                                                onSave={saveNickname}
                                        />
                                ),
                        },
                        { backgroundStyle: { backgroundColor: 'transparent' } }
                );
        }, [closeNicknameSheet, currentNickname, saveNickname, showScrollViewModal, translate]);

        const LanguageOption = ({ languageOption, index }: { languageOption: (typeof languages)[number]; index: number }) => {
                const { language: currentLanguage } = useLanguage();
                const { theme: currentTheme } = useTheme();

                const isSelected = currentLanguage === languageOption.value;
                const groupPosition =
                        languages.length === 1
                                ? 'single'
                                : index === 0
                                        ? 'top'
                                        : index === languages.length - 1
                                                ? 'bottom'
                                                : 'middle';

                return (
                        <SettingsList
                                key={`${languageOption.value}-${index}`}
                                label={languageOption.label}
                                leftIcon={<View style={[languageStyles.flagIcon, { backgroundColor: 'red' }]} />}
                                iconBgColor="transparent"
                                showSeparator={index !== languages.length - 1}
                                groupPosition={groupPosition}
                                noIconIndent
                                rightIcon={
                                        <MaterialCommunityIcons
                                                name={isSelected ? 'circle' : 'circle-outline'}
                                                size={24}
                                                color={isSelected ? primaryColor : currentTheme.screen.icon}
                                        />
                                }
                                handleFunction={() => changeLanguage(languageOption)}
                        />
                );
        };

        const openLanguageModal = useCallback(() => {
                showScrollViewModal(
                        {
                                title: translate(TranslationKeys.language),
                                children: (
                                        <View style={languageStyles.optionsContainer}>
                                                {languages.map((languageOption, index) => (
                                                        <LanguageOption
                                                                key={`${languageOption.value}-${index}`}
                                                                languageOption={languageOption}
                                                                index={index}
                                                        />
                                                ))}
                                        </View>
                                ),
                        },
                        { backgroundStyle: { backgroundColor: theme.sheet.sheetBg } }
                );
        }, [changeLanguage, primaryColor, showScrollViewModal, theme.sheet.sheetBg, translate]);

	const openColorSchemeSheet = () => {
		colorSchemeSheetRef?.current?.expand();
	};

	const closeColorSchemeSheet = () => {
		colorSchemeSheetRef?.current?.close();
	};

	const openDrawerSheet = () => {
		drawerSheetRef?.current?.expand();
	};

	const closeDrawerSheet = () => {
		drawerSheetRef?.current?.close();
	};

	const openAmountColumnModal = () => {
		amountColumnSheetRef?.current?.expand();
	};

	const closeAmountColumnModal = () => {
		amountColumnSheetRef?.current?.close();
	};

	const openFirstDayModal = () => {
		firstDaySheetRef?.current?.expand();
	};

	const closeFirstDayModal = () => {
		firstDaySheetRef?.current?.close();
	};
        const openFoodOffersTimeSheet = () => {
                foodOffersTimeSheetRef?.current?.expand();
        };

        const closeFoodOffersTimeSheet = () => {
                foodOffersTimeSheetRef?.current?.close();
        };

        const handleSelectServer = useCallback(
                async (config: CustomerConfig) => {
                        ServerAPI.updateServerUrl(config.server_url);
                        await AsyncStorage.setItem('server_url_custom', config.server_url);
                        const selectedCustomer = getCustomerEnumForConfig(config) ?? ConfigCustomerEnum.TEST;
                        dispatch({
                                type: SET_SELECTED_CUSTOMER,
                                payload: selectedCustomer,
                        });
                        await AsyncStorage.setItem('selected_customer_enum', selectedCustomer);
                        await performLogout(dispatch, router);
                },
                [dispatch, router]
        );

        const openServerSheet = useCallback(() => {
                openCustomerConfigModal({
                        selectedServer: customerServerUrl,
                        onSelect: handleSelectServer,
                });
        }, [customerServerUrl, handleSelectServer, openCustomerConfigModal]);

        const toggleWebpForAssets = () => {
                dispatch({
                        type: SET_USE_WEBP_FOR_ASSETS,
                        payload: !useWebpForAssets,
                });
        };

        const toggleDebugMode = () => {
                dispatch({
                        type: SET_DEBUG_MODE,
                        payload: !debugMode,
                });
        };

        const handleResetCollectibles = useCallback(() => {
                dispatch({ type: RESET_ALL_COLLECTIBLE_EVENT_DICTS });
                toast(translate(TranslationKeys.reset), 'success');
        }, [dispatch, toast, translate]);

        const handleSelectCollectibleSize = useCallback(
                (_id: string, value: string) => {
                        const nextSize = (collectibleSizeOptions.find(option => option.label === value)?.value || collectibleItemSize || 'medium') as CollectibleItemSize;
                        dispatch({
                                type: SET_COLLECTIBLE_ITEM_SIZE,
                                payload: nextSize,
                        });
                },
                [collectibleItemSize, collectibleSizeOptions, dispatch]
        );

        const toggleCollectibleRandomPosition = useCallback(() => {
                dispatch({
                        type: SET_COLLECTIBLE_RANDOM_POSITION,
                        payload: !collectibleRandomPosition,
                });
        }, [collectibleRandomPosition, dispatch]);

        const handleCheckForUpdates = () => {
                manualCheck();
        };

	const handleDrawerPosition = (position: string) => {
		dispatch({
			type: SET_DRAWER_POSITION,
			payload: position,
		});
		closeDrawerSheet();
	};

	const handleTheme = (theme: any) => {
		setThemeMode(theme);
	};

        const handleLogout = useCallback(() => openConfirmLogoutModal(), [openConfirmLogoutModal]);

        const handleLogin = useCallback(() => openConfirmLogoutModal(true), [openConfirmLogoutModal]);

        const logoutButtonHandler = useMemo(() => (isRegisteredUser ? handleLogout : handleLogin), [handleLogin, handleLogout, isRegisteredUser]);

	const openCanteenSheet = () => {
		canteenSheetRef?.current?.expand();
	};

	const closeCanteenSheet = () => {
		canteenSheetRef?.current?.close();
	};

	const handleDeleteAccount = async () => {
		router.navigate('/(user)/delete-user');
	};

        const priceGroups: Record<PriceGroupKey, { label: string }> = {
                [PriceGroupKey.student]: {
                        label: translate(TranslationKeys.price_group_student),
                },
                [PriceGroupKey.employee]: {
                        label: translate(TranslationKeys.price_group_employee),
                },
                [PriceGroupKey.guest]: {
                        label: translate(TranslationKeys.price_group_guest),
                },
        };

        const openCollectibleSizeModal = useCallback(() => {
                showScrollViewModal(
                        {
                                title: translate(TranslationKeys.collectible_event_item_size),
                                onClose: () => {
                                        if (isOpeningNestedCollectibleModal.current) {
                                                isOpeningNestedCollectibleModal.current = false;
                                                return;
                                        }

                                        setTimeout(() => collectibleSettingsModalRef.current?.(), 150);
                                },
                                children: (
                                        <View style={{ gap: 16 }}>
                                                <DropdownInput
                                                        id="collectible_item_size"
                                                        value={collectibleSizeLabel}
                                                        onChange={handleSelectCollectibleSize}
                                                        error={undefined}
                                                        isDisabled={false}
                                                        custom_type="collectible_item_size"
                                                        options={collectibleSizeOptions.map(option => option.label)}
                                                        allowCustomValues={false}
                                                        onOpenSheet={() => {
                                                                isOpeningNestedCollectibleModal.current = true;
                                                        }}
                                                        onCloseSheet={() => {
                                                                isOpeningNestedCollectibleModal.current = false;
                                                                setTimeout(() => collectibleSettingsModalRef.current?.(), 150);
                                                        }}
                                                />
                                        </View>
                                ),
                        },
                        { backgroundStyle: { backgroundColor: theme.sheet.sheetBg } }
                );
        }, [collectibleSizeLabel, collectibleSizeOptions, handleSelectCollectibleSize, showScrollViewModal, theme.sheet.sheetBg, translate]);

        const openCollectibleSettingsModal = useCallback(() => {
                showScrollViewModal(
                        {
                                title: translate(TranslationKeys.collectible_event_settings),
                                children: (
                                        <View style={{ gap: 0 }}>
                                                <SettingsList
                                                        iconBgColor={primaryColor}
                                                        leftIcon={<MaterialCommunityIcons name="backup-restore" size={24} color={theme.screen.icon} />}
                                                        label={translate(TranslationKeys.collectible_event_reset_collected)}
                                                        rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />}
                                                        handleFunction={handleResetCollectibles}
                                                        groupPosition="top"
                                                />
                                                <SettingsList
                                                        iconBgColor={primaryColor}
                                                        leftIcon={<MaterialCommunityIcons name="image-size-select-large" size={24} color={theme.screen.icon} />}
                                                        label={translate(TranslationKeys.collectible_event_item_size)}
                                                        value={collectibleSizeLabel}
                                                        rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />}
                                                        handleFunction={openCollectibleSizeModal}
                                                        groupPosition="middle"
                                                />
                                                <SettingsList
                                                        iconBgColor={primaryColor}
                                                        leftIcon={<MaterialIcons name="my-location" size={24} color={theme.screen.icon} />}
                                                        label={translate(TranslationKeys.collectible_event_random_position)}
                                                        value={
                                                                collectibleRandomPosition
                                                                        ? translate(TranslationKeys.checked)
                                                                        : translate(TranslationKeys.unchecked)
                                                        }
                                                        rightElement={
                                                                <Switch
                                                                        value={collectibleRandomPosition}
                                                                        onValueChange={toggleCollectibleRandomPosition}
                                                                        trackColor={{ false: theme.screen.iconBg, true: primaryColor }}
                                                                        thumbColor={theme.screen.icon}
                                                                        ios_backgroundColor={theme.screen.iconBg}
                                                                />
                                                        }
                                                        handleFunction={toggleCollectibleRandomPosition}
                                                        groupPosition="bottom"
                                                />
                                        </View>
                                ),
                        },
                        { backgroundStyle: { backgroundColor: theme.sheet.sheetBg } }
                );
        }, [collectibleRandomPosition, collectibleSizeLabel, handleResetCollectibles, openCollectibleSizeModal, primaryColor, showScrollViewModal, theme.screen.icon, theme.screen.iconBg, theme.screen.text, theme.sheet.sheetBg, translate, toggleCollectibleRandomPosition]);

        useEffect(() => {
                collectibleSettingsModalRef.current = openCollectibleSettingsModal;
        }, [openCollectibleSettingsModal]);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.screen.background }}>
			<ScrollView
				style={styles.container}
				contentContainerStyle={{
					...styles.contentContainer,
					backgroundColor: theme.screen.background,
				}}
			>
				<View
					style={{
						...styles.settingContainer,
						width: windowWidth < 500 ? '100%' : isWeb ? '80%' : '100%',
					}}
				>
					<SettingsGroupTitle>{translate(TranslationKeys.group_account_personalization)}</SettingsGroupTitle>
					{/* Account & Nickname */}
					<View style={{ gap: 0 }}>
						<SettingsList iconBgColor={primaryColor} leftIcon={<MaterialCommunityIcons name="clipboard-account" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.account)} value={isRegisteredUser ? user?.id : translate(TranslationKeys.without_account)} handleFunction={() => {}} groupPosition="top" />
						{/* NickName */}
						<SettingsList
							iconBgColor={primaryColor}
							leftIcon={<MaterialCommunityIcons name="account" size={24} color={theme.screen.icon} />}
                                                        label={translate(TranslationKeys.nickname)}
                                                        value={profile?.id ? profile?.nickname : nickNameLocal}
                                                        rightIcon={<MaterialCommunityIcons name="pencil" size={24} color={theme.screen.icon} />}
                                                        handleFunction={() => {
                                                                openNicknameSheet();
                                                        }}
                                                        groupPosition="middle"
                                                />
                                                <SettingsList iconBgColor={primaryColor} leftIcon={<Entypo name="login" size={24} color={theme.screen.icon} />} label={logoutButtonLabel} rightIcon={<Entypo name="login" size={24} color={theme.screen.icon} />} handleFunction={logoutButtonHandler} groupPosition="middle" />
                                                {isRegisteredUser ? (
                                                        <SettingsList iconBgColor={primaryColor} leftIcon={<AntDesign name="user-delete" size={22} color={theme.screen.icon} />} label={`${translate(TranslationKeys.account_delete)}`} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={handleDeleteAccount} groupPosition="middle" />
                                                ) : null}
						<SettingsList iconBgColor={primaryColor} leftIcon={<Ionicons name="language" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.language)} value={languageName} rightIcon={<MaterialCommunityIcons name="pencil" size={20} color={theme.screen.icon} />} handleFunction={() => openLanguageModal()} groupPosition="bottom" />
					</View>
					<SettingsGroupTitle>{translate(TranslationKeys.group_canteen_usage)}</SettingsGroupTitle>
					{/* Canteen */}
					<View style={{ gap: 0 }}>
						<SettingsList iconBgColor={foods_area_color} leftIcon={<MaterialIcons name="restaurant-menu" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.canteen)} value={excerpt(String(selectedCanteen?.alias), 30)} rightIcon={<MaterialCommunityIcons name="pencil" size={20} color={theme.screen.icon} />} handleFunction={openCanteenSheet} groupPosition="top" />
						<SettingsList iconBgColor={foods_area_color} leftIcon={<MaterialIcons name="euro" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.price_group)} value={profile?.price_group && priceGroups[profile.price_group as PriceGroupKey] ? priceGroups[profile.price_group as PriceGroupKey].label : ''} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={() => router.navigate('/price-group')} groupPosition="middle" />
						<SettingsList iconBgColor={foods_area_color} leftIcon={<Ionicons name="card" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.accountbalance)} value={profile?.credit_balance ? showFormatedPrice(formatPrice(profile?.credit_balance)) : '€'} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={() => router.navigate('/account-balance')} groupPosition="middle" />
						<SettingsList iconBgColor={foods_area_color} leftIcon={<Ionicons name="bag-add-sharp" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.eating_habits)} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={() => router.navigate('/eating-habits')} groupPosition="middle" />
						<SettingsList iconBgColor={primaryColor} leftIcon={<Ionicons name="notifications" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.notification)} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={() => router.navigate('/notification')} groupPosition="bottom" />
					</View>
					<SettingsGroupTitle>{translate(TranslationKeys.group_app_settings)}</SettingsGroupTitle>
					{/* color Scheme */}
					<View style={{ gap: 0 }}>
                                                <SettingsList iconBgColor={primaryColor} leftIcon={<MaterialCommunityIcons name="theme-light-dark" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.color_scheme)} value={selectedTheme === 'systematic' ? translate(TranslationKeys.color_scheme_system) : selectedTheme === 'dark' ? translate(TranslationKeys.color_scheme_dark) : translate(TranslationKeys.color_scheme_light)} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={() => openColorSchemeSheet()} groupPosition="top" />
                                                <SettingsList iconBgColor={primaryColor} leftIcon={<Entypo name="menu" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.drawer_config_position)} value={drawerPosition === 'left' ? translate(TranslationKeys.drawer_config_position_left) : drawerPosition === 'right' ? translate(TranslationKeys.drawer_config_position_right) : translate(TranslationKeys.drawer_config_position_system)} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={() => openDrawerSheet()} groupPosition="middle" />
                                                <SettingsList iconBgColor={primaryColor} leftIcon={<FontAwesome5 name="columns" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.amount_columns_for_cards)} value={amountColumnsForcard === 0 ? translate(TranslationKeys.automatic) : amountColumnsForcard} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={() => openAmountColumnModal()} groupPosition="middle" />
                                                <SettingsList iconBgColor={primaryColor} leftIcon={<Feather name="calendar" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.first_day_of_week)} value={translate(firstDayOfTheWeek?.name)} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={() => openFirstDayModal()} groupPosition="bottom" />
                                        </View>
					<SettingsGroupTitle>{translate(TranslationKeys.group_app_management)}</SettingsGroupTitle>
					<View style={{ gap: 0 }}>
                                                <SettingsList iconBgColor={primaryColor} leftIcon={<Ionicons name="cloud-download-outline" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.CHECK_FOR_APP_UPDATES)} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={handleCheckForUpdates} groupPosition="top" />
                                                <SettingsList iconBgColor={primaryColor} leftIcon={<MaterialCommunityIcons name="database-eye" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.dataAccess)} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={() => router.navigate('/data-access')} groupPosition="middle" />
                                                <SettingsList iconBgColor={primaryColor} leftIcon={<MaterialIcons name="event" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.events)} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={() => router.navigate('/events')} groupPosition="middle" />
                                                <SettingsList
                                                        iconBgColor={primaryColor}
                                                        leftIcon={<MaterialCommunityIcons name="trophy-outline" size={24} color={theme.screen.icon} />}
                                                        label={translate(TranslationKeys.collectible_events)}
                                                        rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />}
                                                        handleFunction={() => router.navigate('/collectible-events')}
                                                        groupPosition="middle"
                                                />
                                                <SettingsList
                                                        iconBgColor={primaryColor}
                                                        leftIcon={<MaterialCommunityIcons name="trophy-outline" size={24} color={theme.screen.icon} />}
                                                        label={translate(TranslationKeys.collectible_event_settings)}
                                                        rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />}
                                                        handleFunction={openCollectibleSettingsModal}
                                                        groupPosition="middle"
                                                />
                                                <SettingsList iconBgColor={primaryColor} leftIcon={<MaterialIcons name="support-agent" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.feedback_support_faq)} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={() => router.navigate('/support-FAQ')} groupPosition="middle" />
                                                <SettingsList iconBgColor={primaryColor} leftIcon={<MaterialCommunityIcons name="license" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.license_information)} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={() => router.navigate('/licenseInformation')} groupPosition="middle" />
                                                {/* Terms & Conditions */}
                                                <SettingsList iconBgColor={primaryColor} leftIcon={<MaterialCommunityIcons name="file-document-check" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.terms_and_conditions_accepted_and_privacy_policy_read_at_date)} value={termsAndPrivacyConsentAcceptedDate} handleFunction={() => {}} groupPosition="bottom" />
                                        </View>
                                        <TouchableOpacity
                                                style={styles.footer}
                                                onPress={() => {
                                                        if (isManagement) {
                                                                dispatch({ type: UPDATE_DEVELOPER_MODE, payload: false });
								dispatch({ type: UPDATE_MANAGEMENT, payload: false });
							} else {
								dispatch({ type: UPDATE_DEVELOPER_MODE, payload: true });
								dispatch({ type: UPDATE_MANAGEMENT, payload: true });
							}
						}}
					>
						<View style={styles.logoContainer}>
							<MyImage
								source={{
									uri: getImageUrl(serverInfo?.info?.project?.project_logo),
								}}
								style={styles.logo}
							/>
						</View>
						<Text style={{ ...styles.heading, color: theme.drawerHeading }}>{ServerInfoHelper.getServerName(serverInfo)}</Text>
					</TouchableOpacity>
					<DebugView
						isVisible={isDevMode}
						title={translate(TranslationKeys.debug_mode)}
					>
						<Text style={{ ...styles.devModeText, color: theme.screen.text }}>{translate(TranslationKeys.developerModeActive)}</Text>
						<View style={{ gap: 0 }}>
                                                        <SettingsList iconBgColor={primaryColor} leftIcon={<MaterialCommunityIcons name="server" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.backend_server)} value={selectedCustomerDisplayName} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={openServerSheet} groupPosition="top" />
							<SettingsList iconBgColor={primaryColor} leftIcon={<MaterialCommunityIcons name="clock-outline" size={24} color={theme.screen.icon} />} label={translate(TranslationKeys.foodoffers_next_day_time)} value={(foodOffersNextDayThreshold || '18:00').toString()} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={openFoodOffersTimeSheet} groupPosition="middle" />
							<SettingsList iconBgColor={primaryColor} leftIcon={<MaterialIcons name="image" size={24} color={theme.screen.icon} />} label="Use WebP images" value={useWebpForAssets ? 'WebP' : 'Default'} rightIcon={<Octicons name="chevron-right" size={24} color={theme.screen.icon} />} handleFunction={toggleWebpForAssets} groupPosition="middle" />
							<SettingsList
								iconBgColor={primaryColor}
								leftIcon={<MaterialCommunityIcons name="bank-transfer" size={24} color={theme.screen.icon} />}
								label={translate(TranslationKeys.debug_mode)}
								value={debugMode ? translate(TranslationKeys.checked) : translate(TranslationKeys.unchecked)}
								rightElement={
									<Switch
										value={debugMode}
										onValueChange={toggleDebugMode}
										trackColor={{ false: theme.screen.iconBg, true: primaryColor }}
										thumbColor={theme.screen.icon}
										ios_backgroundColor={theme.screen.iconBg}
									/>
								}
								handleFunction={toggleDebugMode}
								groupPosition="bottom"
							/>
						</View>
					</DebugView>
					<SettingsList
						iconBgColor={primaryColor}
						leftIcon={<MaterialCommunityIcons name="numeric" size={24} color={theme.screen.icon} />}
						label="Version"
						value={getVersionInternalForAppsettingsScreen().toString()}
						handleFunction={() => {}}
						groupPosition="single"
					/>
					<CollectibleSpot collectibleKey={CollectibleAt.collectible_at_settings} />
				</View>
                        </ScrollView>
			{isActive && (
				<>
                                        <BaseBottomSheet
                                                ref={canteenSheetRef}
                                                index={-1}
                                                backgroundStyle={{
                                                        ...styles.sheetBackground,
                                                        backgroundColor: theme.sheet.sheetBg,
                                                }}
                                                enablePanDownToClose
                                                handleComponent={null}
                                                onClose={closeCanteenSheet}
                                        >
                                                <CanteenSelectionSheet closeSheet={closeCanteenSheet} />
                                        </BaseBottomSheet>
					<BaseBottomSheet
						ref={amountColumnSheetRef}
						index={-1}
						backgroundStyle={{
							...styles.sheetBackground,
							backgroundColor: theme.sheet.sheetBg,
						}}
						enablePanDownToClose
						handleComponent={null}
						onClose={closeAmountColumnModal}
					>
						<AmountColumnSheet
							closeSheet={closeAmountColumnModal}
							selectedAmount={amountColumnsForcard}
							onSelect={val => {
								dispatch({
									type: SET_AMOUNT_COLUMNS_FOR_CARDS,
									payload: val,
								});
							}}
						/>
					</BaseBottomSheet>
					<BaseBottomSheet
						ref={firstDaySheetRef}
						index={-1}
						backgroundStyle={{
							...styles.sheetBackground,
							backgroundColor: theme.sheet.sheetBg,
						}}
						enablePanDownToClose
						handleComponent={null}
						onClose={closeFirstDayModal}
					>
						<FirstDaySheet
							closeSheet={closeFirstDayModal}
							selectedDay={firstDayOfTheWeek?.name}
							onSelect={day => {
								dispatch({
									type: SET_FIRST_DAY_OF_THE_WEEK,
									payload: day,
								});
							}}
						/>
					</BaseBottomSheet>
					<BaseBottomSheet
						ref={colorSchemeSheetRef}
						index={-1}
						backgroundStyle={{
							...styles.sheetBackground,
							backgroundColor: theme.sheet.sheetBg,
						}}
						enablePanDownToClose
						handleComponent={null}
						onClose={closeColorSchemeSheet}
					>
						<ColorSchemeSheet
							closeSheet={closeColorSchemeSheet}
							selectedTheme={selectedTheme}
							onSelect={theme => {
								handleTheme(theme);
							}}
						/>
					</BaseBottomSheet>
					<BaseBottomSheet
						ref={drawerSheetRef}
						index={-1}
						backgroundStyle={{
							...styles.sheetBackground,
							backgroundColor: theme.sheet.sheetBg,
						}}
						enablePanDownToClose
						handleComponent={null}
						onClose={closeDrawerSheet}
					>
						<DrawerPositionSheet
							closeSheet={closeDrawerSheet}
							selectedPosition={drawerPosition}
							onSelect={position => {
								handleDrawerPosition(position);
							}}
						/>
					</BaseBottomSheet>
                                        <BaseBottomSheet
                                                ref={foodOffersTimeSheetRef}
                                                index={-1}
                                                backgroundStyle={{
                                                        ...styles.sheetBackground,
							backgroundColor: theme.sheet.sheetBg,
						}}
						enablePanDownToClose
						handleComponent={null}
						onClose={closeFoodOffersTimeSheet}
					>
						<FoodOffersNextDayTimeSheet
							closeSheet={closeFoodOffersTimeSheet}
							initialValue={foodOffersNextDayThreshold}
                                                                onSave={value => {
                                                                        dispatch({
                                                                                type: SET_FOODOFFERS_NEXT_DAY_THRESHOLD,
                                                                                payload: value,
                                                                        });
								closeFoodOffersTimeSheet();
                                                        }}
                                                />
                                        </BaseBottomSheet>
                                </>
                        )}
                </SafeAreaView>
        );
};

export default Settings;
