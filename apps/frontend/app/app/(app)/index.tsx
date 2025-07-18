import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSelectedCanteen from '@/hooks/useSelectedCanteen';
import styles from './styles';
import { useTheme } from '@/hooks/useTheme';
import { CanteenHelper } from '@/redux/actions/Canteens/Canteens';
import { BuildingsHelper } from '@/redux/actions/Buildings/Buildings';
import {
  SET_BUILDINGS,
  SET_CANTEENS,
  SET_SELECTED_CANTEEN,
} from '@/redux/Types/types';
import { useFocusEffect, useRouter } from 'expo-router';
import { useNavigation } from 'expo-router';
import { excerpt, getImageUrl } from '@/constants/HelperFunctions';
import { DatabaseTypes, AppScreens } from 'repo-depkit-common';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootState } from '@/redux/reducer';
import { TranslationKeys } from '@/locales/keys';
import { useLanguage } from '@/hooks/useLanguage';

const Home = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const drawerNavigation =
    useNavigation<DrawerNavigationProp<Record<string, object | undefined>>>();
  const { theme } = useTheme();
  const { translate } = useLanguage();
  const canteenHelper = new CanteenHelper();
  const buildingsHelper = new BuildingsHelper();
  const { serverInfo } = useSelector((state: RootState) => state.settings);
  const { isManagement } = useSelector((state: RootState) => state.authReducer);
  const [loading, setLoading] = useState(false);
  const { canteens } = useSelector(
    (state: RootState) => state.canteenReducer
  );
  const selectedCanteen = useSelectedCanteen();
  const defaultImage = getImageUrl(serverInfo?.info?.project?.project_logo);
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get('window').width
  );

  const checkCanteenSelection = () => {
    if (selectedCanteen) {
      router.push('/(app)/' + AppScreens.FOOD_OFFERS);
    }
  };

  const handleSelectCanteen = (canteen: DatabaseTypes.Canteens) => {
    dispatch({ type: SET_SELECTED_CANTEEN, payload: canteen });
    router.push('/(app)/' + AppScreens.FOOD_OFFERS);
  };

  const getCanteensWithBuildings = async () => {
    try {
      setLoading(true);
      const buildingsData = (await buildingsHelper.fetchBuildings(
        {}
      )) as DatabaseTypes.Buildings[];
      const buildings = buildingsData || [];

      const buildingsDict = buildings.reduce(
        (acc: Record<string, any>, building: any) => {
          acc[building.id] = building;
          return acc;
        },
        {}
      );

      dispatch({ type: SET_BUILDINGS, payload: buildings });

      const canteensData = (await canteenHelper.fetchCanteens(
        {}
      )) as DatabaseTypes.Canteens[];

      const filteredCanteens = canteensData.filter((canteen) => {
        const status = canteen.status || '';

        // Normal users: only show published
        if (!isManagement) {
          return status === 'published';
        }

        // Management: show all, but only handle published + archived
        return status === 'published' || status === 'archived';
      });

      const sortedCanteens = filteredCanteens.sort((a, b) => {
        const aPublished = a.status === 'published';
        const bPublished = b.status === 'published';

        // Move unpublished (archived) to the end
        if (aPublished !== bPublished) {
          return aPublished ? -1 : 1;
        }

        // If both are same status, sort by sort value
        return (a.sort || 0) - (b.sort || 0);
      });

      const updatedCanteens = sortedCanteens.map((canteen) => {
        const building = buildingsDict[canteen?.building as string];
        return {
          ...canteen,
          imageAssetId: building?.image,
          thumbHash: building?.image_thumb_hash,
          image_url: building?.image_remote_url || getImageUrl(building?.image),
        };
      });

      dispatch({ type: SET_CANTEENS, payload: updatedCanteens });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkCanteenSelection();
      getCanteensWithBuildings();
    }, [])
  );

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', handleResize);

    return () => subscription?.remove();
  }, []);

  const iscenter =
    screenWidth > 768 ? 'flex-start' : screenWidth > 480 ? 'center' : 'center';

  if (!loading && (!canteens || canteens.length === 0)) {
    return (
      <View
        style={{
          ...styles.emptyContainer,
          backgroundColor: theme.screen.background,
        }}
      >
        <Text style={{ color: theme.screen.text }}>
          {translate(TranslationKeys.no_canteens_found)}
        </Text>
        <TouchableOpacity
          style={{
            ...styles.continueButton,
            backgroundColor: theme.screen.iconBg,
          }}
          onPress={() => drawerNavigation.toggleDrawer()}
        >
          <Ionicons name='menu' size={24} color={theme.screen.icon} />
          <Text style={{ ...styles.continueLabel, color: theme.screen.text }}>
            {translate(TranslationKeys.open_drawer)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{
        ...styles.mainContainer,
        backgroundColor: theme.screen.background,
      }}
    >
      <ScrollView>
        {loading ? (
          <View
            style={{
              height: 200,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size={30} color={theme.screen.text} />
          </View>
        ) : (
          <View
            style={{
              ...styles.canteensContainer,
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: iscenter,
              gap: 10,
              paddingHorizontal: screenWidth > 800 ? 20 : 0,
            }}
          >
            {canteens &&
              canteens.map((canteen, index: number) => (
                <TouchableOpacity
                  style={{
                    ...styles.card,
                    width: screenWidth > 800 ? 210 : 170,
                    backgroundColor: theme.card.background,
                    marginBottom: 10,
                  }}
                  key={canteen.alias}
                  onPress={() => {
                    handleSelectCanteen(canteen);
                  }}
                >
                  <View
                    style={{
                      ...styles.imageContainer,
                      height: screenWidth > 800 ? 210 : 170,
                    }}
                  >
                    <Image
                      style={styles.image}
                      source={
                        canteen?.image_url
                          ? {
                              uri: canteen?.image_url,
                            }
                          : { uri: defaultImage }
                      }
                    />
                    {canteen.status === 'archived' && (
                      <View style={styles.archiveContainer}>
                        <MaterialCommunityIcons
                          name='archive'
                          size={18}
                          color={theme.screen.text}
                        />
                      </View>
                    )}
                  </View>
                  <Text
                    style={{ ...styles.canteenName, color: theme.screen.text }}
                  >
                    {excerpt(String(canteen.alias), 20)}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Home;
