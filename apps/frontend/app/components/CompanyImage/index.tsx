import React from 'react';
import { Image, ImageResizeMode, ImageStyle, StyleProp } from 'react-native';
import { getImageUrl } from '@/constants/HelperFunctions';
import { DatabaseTypes } from 'repo-depkit-common';

interface CompanyImageProps {
  appSettings?: DatabaseTypes.AppSettings | null;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
}

const CompanyImage: React.FC<CompanyImageProps> = ({
  appSettings,
  style,
  resizeMode = 'contain',
}) => {
  const imageUri =
    appSettings?.company_image &&
    getImageUrl(String(appSettings.company_image))?.split('?')[0];

  const source = imageUri
    ? { uri: imageUri }
    : require('@/assets/images/company.png');

  return <Image source={source} style={style} resizeMode={resizeMode} />;
};

export default CompanyImage;
