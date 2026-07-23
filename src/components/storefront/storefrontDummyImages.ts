import bouquet01 from '../../assets/storefront-products/dummy-bouquet-01.jpg'
import bouquet02 from '../../assets/storefront-products/dummy-bouquet-02.jpg'
import bouquet03 from '../../assets/storefront-products/dummy-bouquet-03.jpg'

const DUMMY_PRODUCT_IMAGES = [bouquet01, bouquet02, bouquet03] as const

const hashProductKey = (value: string): number => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

export const getStorefrontDummyThumbnail = (productKey: string): string =>
  DUMMY_PRODUCT_IMAGES[hashProductKey(productKey) % DUMMY_PRODUCT_IMAGES.length]

export const getStorefrontDummyGallery = (productKey: string): string[] => {
  const startIndex = hashProductKey(productKey) % DUMMY_PRODUCT_IMAGES.length
  return DUMMY_PRODUCT_IMAGES.map(
    (_, offset) => DUMMY_PRODUCT_IMAGES[(startIndex + offset) % DUMMY_PRODUCT_IMAGES.length],
  )
}
