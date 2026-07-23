export const CATALOG_IMAGE_SIZE_PX = 800
export const CATALOG_IMAGE_MAX_BYTES = 100 * 1024

export interface CatalogImageCrop {
  zoom: number
  offsetX: number
  offsetY: number
}

export const getDataUrlByteSize = (dataUrl: string): number => {
  const base64 = dataUrl.split(',')[1] ?? ''
  const padding = (base64.match(/=+$/)?.[0].length ?? 0)
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding)
}

export const drawCatalogImageCrop = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  crop: CatalogImageCrop,
): void => {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Image editor is unavailable in this browser.')

  const outputSize = CATALOG_IMAGE_SIZE_PX
  canvas.width = outputSize
  canvas.height = outputSize

  context.clearRect(0, 0, outputSize, outputSize)
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, outputSize, outputSize)

  const safeZoom = Math.min(3, Math.max(1, crop.zoom))
  const baseScale = Math.max(outputSize / image.naturalWidth, outputSize / image.naturalHeight)
  const scale = baseScale * safeZoom
  const renderedWidth = image.naturalWidth * scale
  const renderedHeight = image.naturalHeight * scale
  const maxShiftX = Math.max(0, (renderedWidth - outputSize) / 2)
  const maxShiftY = Math.max(0, (renderedHeight - outputSize) / 2)
  const normalizedX = Math.min(1, Math.max(-1, crop.offsetX))
  const normalizedY = Math.min(1, Math.max(-1, crop.offsetY))

  const destinationX = (outputSize - renderedWidth) / 2 + normalizedX * maxShiftX
  const destinationY = (outputSize - renderedHeight) / 2 + normalizedY * maxShiftY

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, destinationX, destinationY, renderedWidth, renderedHeight)
}

export const exportCatalogImage = (
  canvas: HTMLCanvasElement,
  maxBytes = CATALOG_IMAGE_MAX_BYTES,
): string => {
  for (let quality = 0.92; quality >= 0.1; quality -= 0.04) {
    const result = canvas.toDataURL('image/jpeg', Number(quality.toFixed(2)))
    if (getDataUrlByteSize(result) <= maxBytes) return result
  }

  throw new Error('This image could not be compressed below 100 KB. Try a simpler image.')
}
