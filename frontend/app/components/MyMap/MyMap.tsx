import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import styles from './styles';
import { useTheme } from '@/hooks/useTheme';
import DEFAULT_TILE_LAYER from './defaultTileLayer';
import type { MapMarker, LeafletWebViewEvent } from './model';
import BaseModal from '@/components/BaseModal';

export interface Position {
  lat: number;
  lng: number;
}

export interface MyMapProps {
  mapCenterPosition: Position;
  zoom?: number;
  mapMarkers?: MapMarker[];
  onMarkerClick?: (id: string) => void;
  onMapEvent?: (event: LeafletWebViewEvent) => void;
  renderMarkerModal?: (
    markerId: string,
    onClose: () => void
  ) => React.ReactNode;
  onMarkerSelectionChange?: (markerId: string | null) => void;
}

const MyMap: React.FC<MyMapProps> = ({
  mapCenterPosition,
  zoom,
  mapMarkers,
  onMarkerClick,
  onMapEvent,
  renderMarkerModal,
  onMarkerSelectionChange,
}) => {
  const { theme } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const html = require('@/assets/leaflet/index.html');

  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  useEffect(() => {
    onMarkerSelectionChange?.(selectedMarker);
  }, [selectedMarker, onMarkerSelectionChange]);



  const sendCoordinates = useCallback(() => {
    if (webViewRef.current) {
      const message = {
        mapCenterPosition,
        zoom: zoom ?? 13,
        mapLayers: [DEFAULT_TILE_LAYER],
        mapMarkers: mapMarkers ?? [],
      };
      const js = `window.postMessage(${JSON.stringify(message)}, '*');`;
      webViewRef.current.injectJavaScript(js);
    }
  }, [mapCenterPosition, zoom, mapMarkers]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data: LeafletWebViewEvent = JSON.parse(event.nativeEvent.data);
        if (data.tag === 'MapComponentMounted') {
          sendCoordinates();
          return;
        }

        if (data.tag === 'onMapMarkerClicked') {
          onMarkerClick?.(data.mapMarkerId);
          onMarkerSelectionChange?.(data.mapMarkerId);
          if (renderMarkerModal) {
            setSelectedMarker(data.mapMarkerId);
          }
        }

        onMapEvent?.(data);
      } catch {
        // ignore malformed messages
      }
    },
    [sendCoordinates, onMarkerClick, onMapEvent, renderMarkerModal, onMarkerSelectionChange]
  );


  useEffect(() => {
    sendCoordinates();
  }, [sendCoordinates]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screen.background }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={html}
        style={styles.webview}
        onMessage={handleMessage}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        domStorageEnabled
        javaScriptEnabled
        containerStyle={{ height: '100%', width: '100%' }}
        onLoadEnd={sendCoordinates}
      />
      {renderMarkerModal && selectedMarker && (
        <BaseModal isVisible={true} onClose={() => setSelectedMarker(null)}>
          {renderMarkerModal(selectedMarker, () => setSelectedMarker(null))}
        </BaseModal>
      )}
    </View>
  );
};

export default MyMap;
