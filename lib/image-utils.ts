/**
 * 將圖片壓縮並轉換為 WebP 格式
 * @param file 原始圖片檔案
 * @param maxWidth 最大寬度（px），超過則等比縮小，預設 800
 * @param quality WebP 壓縮品質 0~1，預設 0.85
 */
export async function compressToWebP(
  file: File,
  maxWidth = 800,
  quality = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("無法建立 canvas context"));

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("圖片壓縮失敗"));
          resolve(new File([blob], "avatar.webp", { type: "image/webp" }));
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("圖片讀取失敗"));
    };

    img.src = objectUrl;
  });
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 依照 react-easy-crop 的 croppedAreaPixels 裁切圖片，輸出正方形 WebP
 * @param imageSrc 圖片的 object URL 或 data URL
 * @param croppedAreaPixels 裁切區域（來自 react-easy-crop onCropComplete）
 * @param outputSize 輸出尺寸（px），預設 400
 * @param quality WebP 品質 0~1，預設 0.85
 */
export async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: CropArea,
  outputSize = 400,
  quality = 0.85
): Promise<File> {
  const img = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("無法建立 canvas context");

  ctx.drawImage(
    img,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("裁切失敗"));
        resolve(new File([blob], "avatar.webp", { type: "image/webp" }));
      },
      "image/webp",
      quality
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("圖片讀取失敗"));
    img.src = src;
  });
}
