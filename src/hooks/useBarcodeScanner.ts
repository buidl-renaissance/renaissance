import { useCallback, useRef } from 'react';
import { useCodeScanner } from 'react-native-vision-camera';

interface BarcodeScanResult {
  data: string;
  type: string;
}

interface UseBarcodeScannerOptions {
  onBarcodeScanned?: (result: BarcodeScanResult) => void;
  enabled?: boolean;
}

/**
 * Hook for barcode scanning with react-native-vision-camera v4
 * Uses built-in useCodeScanner hook for barcode detection
 */
export const useBarcodeScanner = ({
  onBarcodeScanned,
  enabled = true,
}: UseBarcodeScannerOptions = {}) => {
  const lastScannedData = useRef<string | null>(null);
  const scannedRef = useRef(false);

  const handleBarcodeDetected = useCallback(
    (codes: any[]) => {
      if (!enabled || scannedRef.current || !onBarcodeScanned || !codes || codes.length === 0) return;
      
      const code = codes[0];
      const data = code.value || '';
      
      // Prevent duplicate scans
      if (data && data !== lastScannedData.current) {
        console.log('[useBarcodeScanner] QR code detected:', data?.substring?.(0, 50) || data);
        lastScannedData.current = data;
        scannedRef.current = true;
        onBarcodeScanned({
          data,
          type: code.type || 'unknown',
        });
        
        // Reset after a delay
        setTimeout(() => {
          scannedRef.current = false;
        }, 2000);
      }
    },
    [enabled, onBarcodeScanned]
  );

  // Always create the codeScanner, even when disabled
  // On Android, passing undefined can cause issues
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'code-93', 'codabar', 'upc-a', 'upc-e', 'pdf417', 'aztec', 'data-matrix'],
    onCodeScanned: enabled ? handleBarcodeDetected : () => {}, // Empty handler when disabled
  });

  const resetScanner = useCallback(() => {
    lastScannedData.current = null;
    scannedRef.current = false;
  }, []);

  // Always return codeScanner (don't return undefined on Android)
  return {
    codeScanner: codeScanner,
    resetScanner,
  };
};



