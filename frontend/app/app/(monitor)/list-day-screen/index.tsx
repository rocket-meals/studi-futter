import LabelHeader from '@/components/LabelHeader/LabelHeader';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  DimensionValue,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSelector } from 'react-redux';
import {
  getImageUrl,
  showDayPlanPrice,
  showFormatedPrice,
} from '@/constants/HelperFunctions';
import {
  getFoodAttributesTranslation,
  getTextFromTranslation,
} from '@/helper/resourceHelper';
import { myContrastColor, useMyContrastColor } from '@/helper/colorHelper';
import { Image } from 'expo-image';
import styles from './styles';
import { fetchFoodsByCanteen } from '@/redux/actions/FoodOffers/FoodOffers';
import { FoodCategoriesHelper } from '@/redux/actions/FoodCategories/FoodCategories';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/hooks/useLanguage';
import NetInfo from '@react-native-community/netinfo';
import { iconLibraries } from '@/components/Drawer/CustomDrawerContent';
import { FoodAttributesHelper } from '@/redux/actions/FoodAttributes/FoodAttributes';
import { TranslationKeys } from '@/locales/keys';
import useSetPageTitle from '@/hooks/useSetPageTitle';
import { FoodsAttributes, FoodsCategories } from '@/constants/types';
import { ColumnPercentages } from './types';
import { RootState } from '@/redux/reducer';
const index = () => {
  useSetPageTitle('list-day-screen');
  const {
    canteens_id,
    refreshDataIntervalInSeconds,
    nextPageIntervalInSeconds,
    monitor_additional_canteens_id,
    foodAttributesData,
  } = useLocalSearchParams();
  const { translate } = useLanguage();
  const { theme } = useTheme();
  const rowHeight = 80;
  const foodCategoriesHelper = new FoodCategoriesHelper();
  const { markings } = useSelector((state: RootState) => state.food);
  const [foods, setFoods] = useState([]);
  const [optionalFoods, setOptionalFoods] = useState([]);
  const [foodMarkings, setFoodMarkings] = useState<any>({});
  const foodAttributesHelper = new FoodAttributesHelper();

  const [optionalFoodMarkings, setOptionalFoodMarkings] = useState<any>({});
  const [foodCategories, setFoodCategories] = useState<any>({});
  const [optionalFoodCategories, setOptionalFoodCategories] = useState<any>({});
  const [selectedCanteen, setSelectedCanteen] = useState<any>(null);
  const { canteens } = useSelector((state: RootState) => state.canteenReducer);
  const {
    primaryColor: projectColor,
    language,
    appSettings,
    selectedTheme: mode,
  } = useSelector((state: RootState) => state.settings);
  const { foodAttributesDict } = useSelector(
    (state: RootState) => state.foodAttributes
  );
  const progressAnim = useRef(new Animated.Value(0)).current;
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const optionalFoodsScrollRef = useRef<ScrollView>(null);
  const [foodScrollIndex, setFoodScrollIndex] = useState(0);
  const [optionalFoodScrollIndex, setOptionalFoodScrollIndex] = useState(0);
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;
  const headerRef = useRef<View>(null);
  const footerRef = useRef<View>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [foodAttributesColumn, setFoodAttributesColumn] = useState<any>([]);
  const [foodAttributes, setFoodAttributes] = useState<any>(null);
  const [foodAttributesDataFull, setFoodAttributesDataFull] =
    useState<any>(null);
  const [optionalFoodAttributes, setOptionalFoodAttributes] =
    useState<any>(null);

  const foodsScrollRef = useRef<ScrollView>(null);
  const foods_area_color = appSettings?.foods_area_color
    ? appSettings?.foods_area_color
    : projectColor;
  const contrastColor = myContrastColor(
    foods_area_color,
    theme,
    mode === 'dark'
  );

  const totalWidth = 1792;
  const columnPercentages: ColumnPercentages = {
    categorie: ((170 / totalWidth) * 100).toFixed(2),
    name: ((530 / totalWidth) * 100).toFixed(2),
    markings: ((250 / totalWidth) * 100).toFixed(2),
    price: ((170 / totalWidth) * 100).toFixed(2),
    attributes: (
      ((totalWidth - (170 + 530 + 350 + 170)) / totalWidth) *
      100
    ).toFixed(2),
  };
  const handleHeaderLayout = (event: any) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };

  const handleFooterLayout = (event: any) => {
    setFooterHeight(event.nativeEvent.layout.height);
  };
  const tableMaxHeight = windowHeight - (headerHeight + footerHeight);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state?.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAliases = async () => {
      if (!foodAttributesData) {
        setFoodAttributesColumn([]);
        setFoodAttributesDataFull([]);
        return;
      }

      try {
        const parsedData =
          typeof foodAttributesData === 'string'
            ? JSON.parse(foodAttributesData)
            : foodAttributesData;

        const attributeIds: string[] = Array.isArray(parsedData)
          ? parsedData
          : [];

        let attributeDataCopy: any[] = [];

        if (foodAttributesDict) {
          attributeDataCopy = attributeIds.map((id: string) => {
            const attr = foodAttributesDict[id];
            const title = attr?.translations
              ? getFoodAttributesTranslation(attr.translations, language)
              : '';
            return {
              id: id,
              alias: title || attr?.alias || '-',
            };
          });
        } else {
          attributeDataCopy = await Promise.all(
            attributeIds.map(async (id: string) => {
              const attr = (await foodAttributesHelper.fetchFoodAttributeById(
                id
              )) as FoodsAttributes;
              const title = attr?.translations
                ? getFoodAttributesTranslation(attr.translations, language)
                : '';
              return {
                id: id,
                alias: title || attr?.alias || '-',
              };
            })
          );
        }

        setFoodAttributesDataFull(attributeDataCopy);

        const aliases = attributeDataCopy.map((attr) => attr.alias);
        setFoodAttributesColumn(aliases);
      } catch (error) {
        console.error('Error processing food attributes:', error);
        setFoodAttributesColumn([]);
        setFoodAttributesDataFull([]);
      }
    };

    fetchAliases();
  }, [foodAttributesData, foodAttributesDict, language]);

  const fetchSelectedCanteen = useCallback(() => {
    if (!canteens_id || !canteens || canteens.length === 0) return;

    const foundCanteen = canteens?.find(
      (canteen: any) => canteen.id === canteens_id
    );

    if (foundCanteen) {
      setSelectedCanteen(foundCanteen);
    } else {
      console.warn('Canteen not found for ID:', canteens_id);
    }
  }, [canteens_id, canteens]);

  useEffect(() => {
    fetchSelectedCanteen();
  }, [canteens_id, canteens]);

  const filterFoodAttributes = (foodOffers: any) => {
    if (!foodOffers || !foodAttributesDataFull) return {};
    try {
      // Create a map for quick lookup of sort order by attribute id
      const attributeSortMap: Record<string, { index: number; alias: string }> =
        {};
      foodAttributesDataFull?.forEach((attr, index: number) => {
        attributeSortMap[attr.id] = { index, alias: attr.alias };
      });

      // Process each food offer
      const result: Record<string, Array<{ value: any; alias: string }>> = {};

      foodOffers.forEach((offer: any) => {
        if (!offer.id) return;

        // Initialize array with empty values for all possible attributes
        const sortedValues = foodAttributesDataFull.map((attr) => ({
          value: null, // or '-' if you prefer
          alias: attr.alias,
          exists: false,
        }));

        // Fill in the actual values where they exist
        if (offer.attribute_values) {
          offer.attribute_values.forEach((attrValue: any) => {
            const attrId = attrValue.food_attribute?.id;
            if (attributeSortMap[attrId]) {
              const position = attributeSortMap[attrId].index;
              sortedValues[position] = {
                value: attrValue, // or extract specific value if needed
                alias: attributeSortMap[attrId].alias,
                exists: true,
              };
            }
          });
        }

        result[offer.id] = sortedValues;
      });

      return result;
    } catch (error) {
      console.error('Error filtering food attributes:', error);
      return {};
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (foods) {
        const filteredAttributes = filterFoodAttributes(foods);
        setFoodAttributes(filteredAttributes);
      }
      return () => {
        // setFoodAttributes(null);
      };
    }, [foods])
  );

  useFocusEffect(
    useCallback(() => {
      if (optionalFoods) {
        const filteredAttributes = filterFoodAttributes(optionalFoods);
        setOptionalFoodAttributes(filteredAttributes);
      }
      return () => {
        // setOptionalFoodAttributes(null);
      };
    }, [optionalFoods])
  );

  const fetchFoods = async () => {
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const foodData = await fetchFoodsByCanteen(
        String(canteens_id),
        todayDate
      );
      const foodOffers = foodData?.data || [];
      setFoods(foodOffers);

      if (foodOffers?.length > 0) {
        startProgressAnimation();
      }
    } catch (error) {
      console.error('Error fetching Food Offers:', error);
    }
  };

  const fetchOptionalFoods = async () => {
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const foodData = await fetchFoodsByCanteen(
        String(monitor_additional_canteens_id),
        todayDate
      );
      const foodOffers = foodData?.data || [];
      setOptionalFoods(foodOffers);
    } catch (error) {
      console.error('Error fetching Food Offers:', error);
    }
  };

  useEffect(() => {
    if (refreshDataIntervalInSeconds) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      refreshIntervalRef.current = setInterval(() => {
        if (isConnected) {
          fetchFoods();
          if (monitor_additional_canteens_id) {
            fetchOptionalFoods();
          }
        }
      }, Number(refreshDataIntervalInSeconds) * 1000);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [refreshDataIntervalInSeconds]);

  useEffect(() => {
    if (canteens_id) {
      fetchFoods();
    }
    if (monitor_additional_canteens_id) {
      fetchOptionalFoods();
    }
  }, [canteens_id, monitor_additional_canteens_id]);

  const fetchFoodMarkingLabels = useCallback(
    (foodList: any, setMarkingsState: any) => {
      if (!foodList || !markings) return;

      const newMarkings = {};
      foodList.forEach((food: any) => {
        const markingIds =
          food?.markings?.map((mark: any) => mark.markings_id) || [];
        const filteredMarkings =
          markings?.filter((mark: any) => markingIds.includes(mark.id)) || [];

        let dummyMarkings = filteredMarkings.map((item: any) => ({
          image: item?.image_remote_url
            ? { uri: item.image_remote_url }
            : { uri: getImageUrl(item.image) },
          bgColor: item?.background_color,
          color: myContrastColor(
            item?.background_color,
            theme,
            mode === 'dark'
          ),
          shortCode: item?.short_code,
          hide_border: item?.hide_border,
          icon: item?.icon,
        }));

        newMarkings[food.id] = dummyMarkings;
      });

      setMarkingsState(newMarkings);
    },
    [markings, theme, mode]
  );

  const fetchCurrentFoodCategory = async (
    foodList: any,
    setCategoryState: any
  ) => {
    if (!foodList) return;

    const newCategories: any = {};

    for (const food of foodList) {
      try {
        const result = (await foodCategoriesHelper.fetchFoodCategoriesById(
          food?.food?.food_category
        )) as FoodsCategories;
        if (result) {
          newCategories[food.id] = result;
        }
      } catch (error) {
        console.error(`Error fetching category for food ID ${food.id}:`, error);
      }
    }

    setCategoryState(newCategories);
  };

  useEffect(() => {
    if (foods?.length > 0) fetchCurrentFoodCategory(foods, setFoodCategories);
    if (optionalFoods?.length > 0)
      fetchCurrentFoodCategory(optionalFoods, setOptionalFoodCategories);
  }, [foods, optionalFoods]);

  useEffect(() => {
    if (foods?.length > 0) fetchFoodMarkingLabels(foods, setFoodMarkings);
    if (optionalFoods?.length > 0)
      fetchFoodMarkingLabels(optionalFoods, setOptionalFoodMarkings);
  }, [foods, optionalFoods]);

  useEffect(() => {
    if (foods?.length > 0 && nextPageIntervalInSeconds) {
      const interval = setInterval(() => {
        if (!foodsScrollRef.current) return;

        const visibleRows = Math.floor(tableMaxHeight / rowHeight);
        const remainingRows = foods.length - (foodScrollIndex + visibleRows);

        let nextIndex;

        if (remainingRows > 0) {
          nextIndex = foodScrollIndex + 1;
        } else {
          nextIndex = 0;
        }

        setFoodScrollIndex(nextIndex);
        foodsScrollRef.current?.scrollTo({
          y: nextIndex * rowHeight,
          animated: true,
        });

        startProgressAnimation();
      }, Number(nextPageIntervalInSeconds) * 1000);

      return () => clearInterval(interval);
    }
  }, [foods, foodScrollIndex, nextPageIntervalInSeconds, tableMaxHeight]);

  useEffect(() => {
    if (optionalFoods?.length > 0 && nextPageIntervalInSeconds) {
      const interval = setInterval(() => {
        if (!optionalFoodsScrollRef.current) return;

        const visibleRows = Math.floor(tableMaxHeight / rowHeight);
        const remainingRows =
          optionalFoods.length - (optionalFoodScrollIndex + visibleRows);

        let nextIndex;

        if (remainingRows > 0) {
          nextIndex = optionalFoodScrollIndex + 1;
        } else {
          nextIndex = 0;
        }

        setOptionalFoodScrollIndex(nextIndex);
        optionalFoodsScrollRef.current?.scrollTo({
          y: nextIndex * rowHeight,
          animated: true,
        });

        startProgressAnimation();
      }, Number(nextPageIntervalInSeconds) * 1000);

      return () => clearInterval(interval);
    }
  }, [
    optionalFoods,
    optionalFoodScrollIndex,
    nextPageIntervalInSeconds,
    tableMaxHeight,
  ]);

  const startProgressAnimation = () => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: Number(nextPageIntervalInSeconds || 10) * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const chunkedMarkings = [];
  for (let i = 0; i < markings?.length; i += 7) {
    chunkedMarkings.push(markings?.slice(i, i + 7));
  }

  return (
    <ScrollView
      style={[
        styles.outerContainer,
        { backgroundColor: theme.screen.background },
      ]}
    >
      <View
        ref={headerRef}
        onLayout={handleHeaderLayout}
        style={{ width: '100%', height: 100, position: 'relative' }}
      >
        <LabelHeader
          Label={selectedCanteen?.alias ? selectedCanteen?.alias : ''}
          isConnected={isConnected}
        />
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 4,
            backgroundColor: foods_area_color,
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
      <View
        style={{
          height: Dimensions.get('window').height - headerHeight - 10,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{ ...styles.headerRow, backgroundColor: foods_area_color }}
          >
            <Text
              style={[
                styles.headerCell,
                { color: contrastColor },
                {
                  width: (columnPercentages.categorie + '%') as DimensionValue,
                },
              ]}
            >
              {translate(TranslationKeys.category)}
            </Text>
            <Text
              style={[
                styles.headerCell,
                { color: contrastColor },
                { width: (columnPercentages.name + '%') as DimensionValue },
              ]}
            >
              {translate(TranslationKeys.foodname)}
            </Text>
            <Text
              style={[
                styles.headerCell,
                { color: contrastColor },
                { width: (columnPercentages.markings + '%') as DimensionValue },
              ]}
            >
              {translate(TranslationKeys.markings)}
            </Text>
            {foodAttributesColumn &&
              foodAttributesColumn.map((column: any) => {
                const attributeColumnWidth = (
                  Number(columnPercentages.attributes) /
                  foodAttributesColumn.length
                ).toFixed(2);
                return (
                  <Text
                    style={[
                      styles.headerCell,
                      { color: contrastColor },
                      { width: (attributeColumnWidth + '%') as DimensionValue },
                    ]}
                    key={column}
                  >
                    {column}
                  </Text>
                );
              })}
            <Text
              style={[
                styles.headerCell,
                { color: contrastColor },
                { width: (columnPercentages.price + '%') as DimensionValue },
              ]}
            >
              {` ${translate(
                TranslationKeys.price_group_student
              )} / ${translate(
                TranslationKeys.price_group_employee
              )} / ${translate(TranslationKeys.price_group_guest)}`}
            </Text>
          </View>
          <View
            style={[
              styles.container,
              {
                backgroundColor: theme.screen.background,
                maxHeight: tableMaxHeight - 50,
              },
              windowWidth < 900 && {
                minHeight: 400,
              },
            ]}
          >
            {foods?.length > 0 && (
              <View
                style={{ ...styles.row, backgroundColor: foods_area_color }}
              >
                <Text style={{ ...styles.body, color: contrastColor }}>
                  {`${translate(TranslationKeys.foods)}: ${foods.length}/ ${
                    foods?.length
                  }`}
                </Text>
              </View>
            )}
            <ScrollView
              ref={foodsScrollRef}
              style={[
                {
                  maxHeight:
                    foods?.length > 0 && optionalFoods?.length > 0
                      ? tableMaxHeight / 2 - 20
                      : tableMaxHeight,
                },
                windowWidth < 900 && { minHeight: 200 },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.table]}>
                {foods &&
                  foods?.map((item: any, index) => {
                    return (
                      <View
                        key={index}
                        style={[
                          styles.dataRow,
                          {
                            backgroundColor:
                              index % 2 === 0 ? '#d3d3d3' : '#f5f5f5',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.cell,
                            {
                              width: (columnPercentages.categorie +
                                '%') as DimensionValue,
                            },
                          ]}
                        >
                          {foodCategories[item.id]?.alias || '-'}
                        </Text>
                        <Text
                          style={[
                            styles.cell,
                            {
                              width: (columnPercentages.name +
                                '%') as DimensionValue,
                            },
                          ]}
                        >
                          {getTextFromTranslation(
                            item?.food?.translations,
                            language
                          )}
                        </Text>
                        <View
                          style={[
                            styles.cell,
                            {
                              width: (columnPercentages.markings +
                                '%') as DimensionValue,
                            },
                          ]}
                        >
                          {foodMarkings[item.id] &&
                            foodMarkings[item.id]?.map((item: any) => {
                              if (item?.icon) {
                                const iconParts = item?.icon?.split(':') || [];
                                const [library, name] = iconParts;
                                const Icon = library && iconLibraries[library];
                                return (
                                  <View
                                    style={{
                                      ...styles.iconMarking,
                                      backgroundColor: item?.bgColor,
                                      borderWidth: item?.hide_border ? 0 : 1,
                                      borderColor: item.color,
                                    }}
                                  >
                                    <Icon
                                      name={name}
                                      size={14}
                                      color={item.color}
                                    />
                                  </View>
                                );
                              }
                              if (item?.shortCode && !item?.image?.uri) {
                                return (
                                  <View
                                    style={{
                                      ...styles.shortCode,
                                      backgroundColor: item?.bgColor,
                                      borderWidth: item?.hide_border ? 0 : 1,
                                      borderColor: item.color,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: item.color,
                                        fontSize: 12,
                                        lineHeight: 18,
                                      }}
                                    >
                                      {item?.shortCode}
                                    </Text>
                                  </View>
                                );
                              }
                              if (item?.image?.uri) {
                                return (
                                  <Image
                                    source={item?.image?.uri}
                                    style={[
                                      styles.icon,
                                      item?.image?.uri && {
                                        backgroundColor:
                                          item?.bgColor && item?.bgColor,
                                        borderRadius: item?.bgColor ? 8 : 0,
                                      },
                                    ]}
                                  />
                                );
                              }
                            })}
                        </View>
                        {foodAttributes[item?.id] &&
                          foodAttributes[item?.id]?.map((attr: any) => {
                            const attributeColumnWidth = (
                              Number(columnPercentages.attributes) /
                              foodAttributes[item?.id].length
                            ).toFixed(2);
                            if (!attr?.value) {
                              return (
                                <Text
                                  key={`${item.id}`}
                                  style={[
                                    styles.cell,
                                    {
                                      width: (attributeColumnWidth +
                                        '%') as DimensionValue,
                                    },
                                  ]}
                                >
                                  -
                                </Text>
                              );
                            }

                            const { number_value } = attr.value;
                            const { prefix, suffix } =
                              attr?.value?.food_attribute || {};

                            if (
                              number_value === undefined ||
                              number_value === null
                            ) {
                              return (
                                <Text
                                  key={`${item.id}`}
                                  style={[
                                    styles.cell,
                                    {
                                      width: (attributeColumnWidth +
                                        '%') as DimensionValue,
                                    },
                                  ]}
                                >
                                  -
                                </Text>
                              );
                            }

                            let value = '';
                            if (prefix) value += `${prefix} `;
                            value += number_value;
                            if (suffix) value += ` ${suffix}`;

                            return (
                              <Text
                                key={`${item.id}`}
                                style={[
                                  styles.cell,
                                  {
                                    width: (attributeColumnWidth +
                                      '%') as DimensionValue,
                                  },
                                ]}
                              >
                                {value.trim()}
                              </Text>
                            );
                          })}
                        <Text
                          style={[
                            styles.cell,
                            {
                              width: (columnPercentages.price +
                                '%') as DimensionValue,
                            },
                          ]}
                        >
                          {`${showFormatedPrice(
                            showDayPlanPrice(item, 'student')
                          )} / ${showFormatedPrice(
                            showDayPlanPrice(item, 'employee')
                          )} / ${showFormatedPrice(
                            showDayPlanPrice(item, 'guest')
                          )}`}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            </ScrollView>
            {optionalFoods?.length > 0 && (
              <View
                style={{ ...styles.row, backgroundColor: foods_area_color }}
              >
                <Text style={{ ...styles.body, color: contrastColor }}>
                  {`${translate(TranslationKeys.foods)}: ${
                    optionalFoods?.length
                  } / ${optionalFoods?.length}`}
                </Text>
              </View>
            )}
            <ScrollView
              ref={optionalFoodsScrollRef}
              style={[
                {
                  maxHeight:
                    optionalFoods?.length > 0
                      ? foods?.length > 0
                        ? tableMaxHeight / 2 - 20
                        : tableMaxHeight
                      : 0,
                },
                windowWidth < 900 && { minHeight: 200 },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.table]}>
                {optionalFoods &&
                  optionalFoods?.map((item: any, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dataRow,
                        {
                          backgroundColor:
                            index % 2 === 0 ? '#d3d3d3' : '#f5f5f5',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.cell,
                          {
                            width: (columnPercentages.categorie +
                              '%') as DimensionValue,
                          },
                        ]}
                      >
                        {optionalFoodCategories[item.id]?.alias || '-'}
                      </Text>
                      <Text
                        style={[
                          styles.cell,
                          {
                            width: (columnPercentages.name +
                              '%') as DimensionValue,
                          },
                        ]}
                      >
                        {getTextFromTranslation(
                          item?.food?.translations,
                          language
                        )}
                      </Text>
                      <View
                        style={[
                          styles.cell,
                          {
                            width: (columnPercentages.markings +
                              '%') as DimensionValue,
                          },
                        ]}
                      >
                        {optionalFoodMarkings[item.id] &&
                          optionalFoodMarkings[item.id]?.map((item: any) => {
                            if (item?.icon) {
                              const iconParts = item?.icon?.split(':') || [];
                              const [library, name] = iconParts;
                              const Icon = library && iconLibraries[library];
                              return (
                                <View
                                  style={{
                                    ...styles.iconMarking,
                                    backgroundColor: item?.bgColor,
                                    borderWidth: item?.hide_border ? 0 : 1,
                                    borderColor: item.color,
                                  }}
                                >
                                  <Icon
                                    name={name}
                                    size={14}
                                    color={item.color}
                                  />
                                </View>
                              );
                            }
                            if (item?.shortCode && !item?.image?.uri) {
                              return (
                                <View
                                  style={{
                                    ...styles.shortCode,
                                    backgroundColor: item?.bgColor,
                                    borderWidth: item?.hide_border ? 0 : 1,
                                    borderColor: item.color,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: item.color,
                                      fontSize: 12,
                                      lineHeight: 18,
                                    }}
                                  >
                                    {item?.shortCode}
                                  </Text>
                                </View>
                              );
                            } else if (item?.image?.uri) {
                              return (
                                <Image
                                  source={item?.image?.uri}
                                  style={[
                                    styles.icon,
                                    item?.image?.uri && {
                                      backgroundColor:
                                        item?.bgColor && item?.bgColor,
                                      borderRadius: item?.bgColor ? 8 : 0,
                                    },
                                  ]}
                                />
                              );
                            }
                          })}
                      </View>
                      {optionalFoodAttributes[item?.id] &&
                        optionalFoodAttributes[item?.id]?.map((attr: any) => {
                          const attributeColumnWidth = (
                            Number(columnPercentages.attributes) /
                            optionalFoodAttributes[item?.id].length
                          ).toFixed(2);
                          if (!attr?.value) {
                            return (
                              <Text
                                key={`${item.id}`}
                                style={[
                                  styles.cell,
                                  {
                                    width: (attributeColumnWidth +
                                      '%') as DimensionValue,
                                  },
                                ]}
                              >
                                -
                              </Text>
                            );
                          }

                          const { number_value } = attr?.value;
                          const { prefix, suffix } =
                            attr?.value?.food_attribute || {};

                          if (
                            number_value === undefined ||
                            number_value === null
                          ) {
                            return (
                              <Text
                                key={`${item.id}`}
                                style={[
                                  styles.cell,
                                  {
                                    width: (attributeColumnWidth +
                                      '%') as DimensionValue,
                                  },
                                ]}
                              >
                                -
                              </Text>
                            );
                          }

                          let value = '';
                          if (prefix) value += `${prefix} `;
                          value += number_value;
                          if (suffix) value += ` ${suffix}`;

                          return (
                            <Text
                              key={`${item.id}`}
                              style={[
                                styles.cell,
                                {
                                  width: (attributeColumnWidth +
                                    '%') as DimensionValue,
                                },
                              ]}
                            >
                              {value.trim()}
                            </Text>
                          );
                        })}

                      <Text
                        style={[
                          styles.cell,
                          {
                            width: (columnPercentages.price +
                              '%') as DimensionValue,
                          },
                        ]}
                      >
                        {`${showFormatedPrice(
                          showDayPlanPrice(item, 'student')
                        )} / ${showFormatedPrice(
                          showDayPlanPrice(item, 'employee')
                        )} / ${showFormatedPrice(
                          showDayPlanPrice(item, 'guest')
                        )}`}
                      </Text>
                    </View>
                  ))}
              </View>
            </ScrollView>
          </View>
        </View>
        <View
          ref={footerRef}
          onLayout={handleFooterLayout}
          style={{
            ...styles.footer,
            borderTopWidth: 2,
            borderTopColor: foods_area_color,
            height: 230,
          }}
        >
          <View
            style={[
              styles.gridContainer,
              { backgroundColor: theme.screen.background },
            ]}
          >
            {chunkedMarkings &&
              chunkedMarkings?.map((chunk, chunkIndex) => (
                <View key={chunkIndex} style={styles.mainContainer}>
                  {chunk.map((marking: any, index: any) => {
                    const markingImage = marking?.image_remote_url
                      ? { uri: marking?.image_remote_url }
                      : { uri: getImageUrl(marking?.image) };
                    const markingText = getTextFromTranslation(
                      marking?.translations,
                      language
                    );
                    const MarkingBackgroundColor = marking?.background_color;
                    const MarkingColor = useMyContrastColor(
                      marking?.background_color,
                      theme,
                      mode === 'dark'
                    );
                    const iconParts = marking?.icon?.split(':') || [];
                    const [library, name] = iconParts;
                    const Icon = library && iconLibraries[library];
                    return (
                      <View key={index} style={styles.iconText}>
                        {markingImage?.uri && (
                          <Image
                            source={markingImage}
                            style={[
                              styles.logoImage,
                              markingImage.uri && {
                                backgroundColor:
                                  marking?.background_color &&
                                  marking?.background_color,
                                borderRadius: marking?.background_color && 8,
                              },
                            ]}
                          />
                        )}

                        {!markingImage?.uri &&
                          !marking?.icon &&
                          marking?.short_code && (
                            <View
                              style={{
                                ...styles.shortCode,
                                backgroundColor: MarkingBackgroundColor,
                                borderWidth: marking?.hide_border ? 0 : 1,
                                borderColor: MarkingColor,
                              }}
                            >
                              <Text
                                style={{
                                  color: MarkingColor,
                                  fontSize: 10,
                                  lineHeight: 14,
                                }}
                              >
                                {marking?.short_code}
                              </Text>
                            </View>
                          )}
                        {marking?.icon && !markingImage?.uri && (
                          <View
                            style={{
                              ...styles.iconMarking,
                              backgroundColor: MarkingBackgroundColor,
                              borderWidth: marking?.hide_border ? 0 : 1,
                              borderColor: MarkingColor,
                            }}
                          >
                            <Icon name={name} size={14} color={MarkingColor} />
                          </View>
                        )}
                        <Text
                          style={{ ...styles.title, color: theme.screen.text }}
                        >
                          {markingText}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default index;
