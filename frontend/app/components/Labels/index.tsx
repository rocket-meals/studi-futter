import React, { useMemo } from 'react';
import { Linking, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '@/hooks/useTheme';
import styles from './styles';
import RedirectButton from '../RedirectButton';
import MarkingLabels from '../MarkingLabels/MarkingLabels';
import { getFoodOffer } from '@/constants/HelperFunctions';
import { studentUnionUrl } from '@/constants/Constants';
import { FoodoffersMarkings, Markings } from '@/constants/types';
import { createSelector } from 'reselect';
import { useLanguage } from '@/hooks/useLanguage';
import { TranslationKeys } from '@/locales/keys';
import { RootState } from '@/redux/reducer';

interface LabelsProps {
  foodDetails: any;
  offerId: string;
  handleMenuSheet?: () => void;
  color: string;
}

const selectMarkings = (state: RootState) => state.food.markings;

export const selectFoodOffer = (offerId: string) =>
  createSelector(
    [(state: RootState) => state.canteenReducer.selectedCanteenFoodOffers],
    (foodOffers) => getFoodOffer(foodOffers, offerId)
  );

const Labels: React.FC<LabelsProps> = ({
  foodDetails,
  offerId,
  handleMenuSheet,
  color,
}) => {
  const { theme } = useTheme();
  const { translate } = useLanguage();
  const { primaryColor, appSettings } = useSelector(
    (state: RootState) => state.settings
  );
  const foods_area_color = appSettings?.foods_area_color
    ? appSettings?.foods_area_color
    : primaryColor;

  const markings = useSelector(selectMarkings);
  const foodOffer = useSelector(selectFoodOffer(offerId));

  const handleRedirect = () => {
    Linking.openURL(studentUnionUrl).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };

  const foodMarkings = useMemo(() => {
    if (!foodOffer?.markings) return [];
    return foodOffer.markings
      ?.map((marking: FoodoffersMarkings) =>
        markings.find((mark: Markings) => mark.id === marking?.markings_id)
      )
      .filter((mark: any): mark is Markings => Boolean(mark))
      .sort((a: any, b: any) => b.sort - a.sort);
  }, [foodOffer, markings]);

  return (
    <View style={styles.container}>
      <Text style={{ ...styles.heading, color: theme.screen.text }}>
        {translate(TranslationKeys.markings)}
      </Text>

      {foodMarkings?.map((marking: Markings) => (
        <MarkingLabels
          key={marking.id}
          markingId={marking.id}
          handleMenuSheet={handleMenuSheet}
        />
      ))}

      <Text
        style={{
          ...styles.body,
          color: theme.screen.text,
          fontStyle: 'italic',
        }}
      >
        {translate(TranslationKeys.FOOD_LABELING_INFO)}
      </Text>
      <RedirectButton
        type='link'
        onClick={handleRedirect}
        label='Studentenwerk Osnabrueck'
        backgroundColor={foods_area_color}
        color='#FFF'
      />
    </View>
  );
};

export default Labels;
