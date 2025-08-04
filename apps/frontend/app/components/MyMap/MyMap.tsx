import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import styles from './styles';
import { useTheme } from '@/hooks/useTheme';
import DEFAULT_TILE_LAYER from './defaultTileLayer';
import type { MapMarker, LeafletWebViewEvent } from './model';
import BaseModal from '@/components/BaseModal';

// JavaScript to inject for ensuring proper image loading
const INJECTED_JAVASCRIPT = `
(function() {
  // Helper function to ensure images load properly
  function ensureImagesLoad() {
    // Find all images in the document
    const images = document.querySelectorAll('img');
    
    // For each image, add error handling and force reload if needed
    images.forEach(img => {
      // Skip already processed images
      if (img.dataset.processed) return;
      
      // Mark as processed
      img.dataset.processed = 'true';
      
      // Add error handler
      img.onerror = function() {
        // If image failed to load, try with crossorigin attribute
        if (!this.crossOrigin) {
          this.crossOrigin = 'anonymous';
          // Force reload by updating the src
          const currentSrc = this.src;
          this.src = '';
          setTimeout(() => { this.src = currentSrc; }, 0);
        }
      };
      
      // For images that are already loaded but not visible, force a reload
      if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
        img.onerror();
      }
    });
  }
  
  // Run immediately
  ensureImagesLoad();
  
  // Also run when DOM changes (for dynamically added images)
  const observer = new MutationObserver(mutations => {
    ensureImagesLoad();
  });
  
  // Start observing the document
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
})();
`;

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
      // Process markers to ensure proper image URL handling
      const processedMarkers = (mapMarkers ?? []).map(marker => {
        // Create a new marker object to avoid mutating the original
        const processedMarker = { ...marker };
        
        // Handle Base64 image URLs - ensure they have the correct prefix if needed
        if (processedMarker.iconUrl && processedMarker.iconUrl.startsWith('data:')) {
          // Ensure Base64 images have proper formatting
          if (!processedMarker.iconUrl.includes(';base64,')) {
            processedMarker.iconUrl = processedMarker.iconUrl.replace('data:', 'data:image/png;base64,');
          }
        }
        
        return processedMarker;
      });
      
      const message = {
        mapCenterPosition,
        zoom: zoom ?? 13,
        mapLayers: [DEFAULT_TILE_LAYER],
        mapMarkers: processedMarkers,
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
        cacheEnabled={false}
        incognito={true}
        mixedContentMode="always"
        userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        containerStyle={{ height: '100%', width: '100%' }}
        injectedJavaScript={INJECTED_JAVASCRIPT}
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
