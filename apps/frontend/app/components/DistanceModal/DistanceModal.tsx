import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import { useSelector } from 'react-redux';
import { myContrastColor } from '@/helper/colorHelper';
import { TranslationKeys } from '@/locales/keys';
import type { RootState } from '@/redux/reducer';
import BaseBottomModal from '@/components/BaseBottomModal';

export interface DistanceModalProps {
  visible: boolean;
  onClose: () => void;
  onUseCurrentPosition: () => void;
}

const DistanceModal: React.FC<DistanceModalProps> = ({
  visible,
  onClose,
  onUseCurrentPosition,
}) => {
  const { theme } = useTheme();
  const { translate } = useLanguage();
  const { appSettings, primaryColor, selectedTheme: mode } = useSelector(
    (state: RootState) => state.settings
  );
  const housingAreaColor = appSettings?.housing_area_color
    ? appSettings.housing_area_color
    : primaryColor;
  const contrastColor = myContrastColor(housingAreaColor, theme, mode === 'dark');

  return (
    <BaseBottomModal
      visible={visible}
      onClose={onClose}
      title={translate(TranslationKeys.distance)}
    >
      <View style={{ gap: 20, padding: 20 }}>
        <Text style={{ color: theme.screen.text, textAlign: 'center' }}>
          {translate(
            TranslationKeys.distance_based_canteen_selection_or_if_asked_on_real_location
          )}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: housingAreaColor,
            padding: 10,
            borderRadius: 8,
            alignItems: 'center',
          }}
          onPress={onUseCurrentPosition}
        >
          <Text style={{ color: contrastColor }}>
            {translate(TranslationKeys.use_current_position_for_distance)}
          </Text>
        </TouchableOpacity>
        <Text style={{ color: theme.screen.text }}>
          {
            'Wir teilen deinen aktuellen Standort nicht mit uns. Er wird ausschließlich auf deinem Handy verwendet, um die Entfernung zu berechnen. Aus Datenschutzgründen verlassen diese Daten niemals dein Gerät und werden nicht gespeichert. So kannst du sicher sein, dass deine Privatsphäre geschützt ist, während du den vollen Funktionsumfang testen kannst.'
          }
        </Text>
        <Text style={{ color: theme.screen.text }}>
          {
            'Lorem insulin dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          }
        </Text>
        <Text style={{ color: theme.screen.text }}>
          {
            'Curabitur tempus id lacus a faucibus. Sed quis gravida risus, a interdum nisl. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Morbi placerat ultrices urna. Cras ut sollicitudin libero. Duis sed nisl luctus, semper est non, lobortis mauris. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Quisque ac gravida nunc. Integer at dui at tortor eleifend tincidunt. Suspendisse potenti. Praesent vehicula porttitor massa, in vehicula lectus porttitor ac. Vivamus vitae lorem vitae turpis malesuada varius.'
          }
        </Text>
      </View>
    </BaseBottomModal>
  );
};

export default DistanceModal;
