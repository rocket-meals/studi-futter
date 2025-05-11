import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSelector } from 'react-redux';
import { isWeb } from '@/constants/Constants';
import { useLanguage } from '@/hooks/useLanguage';
import { RootState } from '@/redux/reducer';

// Define the type for the theme prop
type Position = {
  id: string;
  name: string;
  icon: string;
};

// Define the props for the component
type DrawerPositionProps = {
  position: Position;
  isSelected: boolean;
  onPress: () => void;
};

const DrawerPosition: React.FC<DrawerPositionProps> = ({
  position,
  isSelected,
  onPress,
}) => {
  const { theme } = useTheme();
  const { primaryColor } = useSelector((state: RootState) => state.settings);
  const { translate } = useLanguage();
  return (
    <TouchableOpacity
      style={{
        ...styles.row,
        paddingHorizontal: isWeb ? 20 : 10,

        backgroundColor: isSelected ? primaryColor : theme.screen.iconBg,
      }}
      onPress={onPress}
    >
      {/* Theme Icon */}
      <MaterialCommunityIcons
        name={position.icon}
        size={24}
        color={isSelected ? theme.activeText : theme.screen.icon}
        style={styles.icon}
      />

      {/* Theme Text */}
      <Text
        style={{
          ...styles.text,
          color: isSelected ? theme.activeText : theme.header.text,
        }}
      >
        {translate(position.name)}
      </Text>

      {/* Radio Button */}
      <MaterialCommunityIcons
        name={isSelected ? 'checkbox-marked' : 'checkbox-blank'}
        size={24}
        color={isSelected ? '#ffffff' : '#ffffff'}
        style={styles.radioButton}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    marginTop: 10,
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  radioButton: {
    marginLeft: 'auto',
  },
});

export default DrawerPosition;
