export interface OptimizedImageResult {
  dataUrl: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  width: number;
  height: number;
  compressionRatioPercent: number;
}

/**
 * Intelligently resizes and compresses high-resolution trading chart screenshots.
 * Ensures candlestick wicks, price text, numbers, and lines remain razor-sharp
 * for both human review and multimodal AI analysis (Claude, GPT, Gemini).
 *
 * - Max Width: 1600px (standard crystal-clear chart width)
 * - Format: JPEG with high quality (0.85)
 * - Canvas smoothing: high quality bicubic interpolation
 */
export async function optimizeChartImage(
  file: File,
  maxWidth = 1600,
  quality = 0.85
): Promise<OptimizedImageResult> {
  const originalSizeKB = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read the image file.'));
    };

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('Failed to load or decode image.'));
      };

      img.onload = () => {
        let { width, height } = img;

        // If image is wider than maxWidth, calculate proportional height
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original if canvas context unavailable
          const fallbackDataUrl = reader.result as string;
          resolve({
            dataUrl: fallbackDataUrl,
            originalSizeKB,
            compressedSizeKB: originalSizeKB,
            width: img.width,
            height: img.height,
            compressionRatioPercent: 0,
          });
          return;
        }

        // Enable high quality bicubic smoothing to keep chart wicks and text razor-sharp
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-quality JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // Estimate size in KB of base64 data URL
        const base64Length = compressedDataUrl.length - (compressedDataUrl.indexOf(',') + 1);
        const compressedSizeKB = Math.round((base64Length * 0.75) / 1024);

        const ratio =
          originalSizeKB > 0
            ? Math.max(0, Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100))
            : 0;

        resolve({
          dataUrl: compressedDataUrl,
          originalSizeKB,
          compressedSizeKB,
          width,
          height,
          compressionRatioPercent: ratio,
        });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
