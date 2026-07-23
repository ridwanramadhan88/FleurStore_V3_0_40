/**
 * @file catalogCsvDomain.ts
 * @description CSV import/export for the Catalog, per Product Catalog
 * System Specification v2.0. Import columns:
 *   Category | Material | Product Name | Size | Price
 * Product ID and SKU are ignored on import (always regenerated or matched)
 * and included on export for reporting only. Stock/quantity is NOT part of
 * the Catalog CSV — on-hand inventory lives in the Stock module and is
 * updated automatically as orders come in, not edited per catalog variant.
 */

import type {
  CatalogCategory,
  CatalogMaterial,
  CatalogProduct,
} from '../store/catalogStoreTypes'

const CSV_IMPORT_COLUMNS = [
  'Category',
  'Material',
  'Product Name',
  'Size',
  'Price',
] as const

export interface CatalogCsvRow {
  category: CatalogCategory
  material: CatalogMaterial
  productName: string
  size: string
  price: number
}

export interface CsvParseError {
  row: number
  message: string
}

export interface CsvParseResult {
  rows: CatalogCsvRow[]
  errors: CsvParseError[]
}

/**
 * @description Builds a downloadable CSV template showing the exact header
 * order and one valid example row per current category (alternating
 * Fresh/Artificial), so users importing their own CSV can see accepted
 * category names up front instead of hitting "Unknown category" errors
 * after the fact. Category names are read live from the store, so the
 * template always reflects whatever categories the shop has configured.
 */
export const buildCatalogCsvTemplate = (categoryNames: string[]): string => {
  const header = CSV_IMPORT_COLUMNS.join(',')
  const exampleRows = categoryNames.map((category, index) => {
    const material = index % 2 === 0 ? 'Fresh' : 'Artificial'
    const singular = category.endsWith('s') ? category.slice(0, -1) : category
    const productName = `Example ${singular}`
    const size = 'Medium'
    const price = 150000
    return [category, material, productName, size, price].join(',')
  })
  return [header, ...exampleRows].join('\n')
}

const normalizeCategory = (
  value: string,
  validCategories: string[],
): CatalogCategory | undefined =>
  validCategories.find(
    (category) => category.toLowerCase() === value.trim().toLowerCase(),
  )

const normalizeMaterial = (value: string): CatalogMaterial | undefined => {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'fresh') return 'fresh'
  if (normalized === 'artificial') return 'artificial'
  return undefined
}

const splitCsvLine = (line: string): string[] =>
  line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''))

/**
 * @description Parses raw CSV text using the fixed import column order.
 * Product ID and SKU columns, if present, are ignored — they're always
 * regenerated or matched against existing products/variants instead.
 */
export const parseCatalogCsv = (
  csvText: string,
  validCategories: string[],
): CsvParseResult => {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length === 0) return { rows: [], errors: [] }

  const header = splitCsvLine(lines[0]).map((cell) => cell.toLowerCase())
  const colIndex = {
    category: header.indexOf('category'),
    material: header.indexOf('material'),
    productName: header.indexOf('product name'),
    size: header.indexOf('size'),
    price: header.indexOf('price'),
  }

  const rows: CatalogCsvRow[] = []
  const errors: CsvParseError[] = []

  for (let i = 1; i < lines.length; i += 1) {
    const rowNumber = i + 1 // 1-based, header is row 1
    const cells = splitCsvLine(lines[i])

    const rawCategory = cells[colIndex.category] ?? ''
    const rawMaterial = cells[colIndex.material] ?? ''
    const productName = (cells[colIndex.productName] ?? '').trim()
    const size = (cells[colIndex.size] ?? '').trim()
    const rawPrice = cells[colIndex.price] ?? ''

    const category = normalizeCategory(rawCategory, validCategories)
    const material = normalizeMaterial(rawMaterial)
    const price = Number.parseInt(rawPrice, 10)

    if (!category) {
      errors.push({
        row: rowNumber,
        message: `Unknown category "${rawCategory}" (expected one of: ${validCategories.join(', ')})`,
      })
      continue
    }
    if (!material) {
      errors.push({
        row: rowNumber,
        message: `Material must be "Fresh" or "Artificial", got "${rawMaterial}"`,
      })
      continue
    }
    if (!productName) {
      errors.push({ row: rowNumber, message: 'Product Name is required' })
      continue
    }
    if (!size) {
      errors.push({ row: rowNumber, message: 'Size is required' })
      continue
    }
    if (!Number.isFinite(price) || price < 0) {
      errors.push({ row: rowNumber, message: `Invalid Price "${rawPrice}"` })
      continue
    }

    rows.push({ category, material, productName, size, price })
  }

  return { rows, errors }
}

/**
 * @description Key used to detect an existing product during import, per
 * spec: "Detect existing products using Category + Material + Product Name".
 */
export const productMatchKey = (
  category: CatalogCategory,
  material: CatalogMaterial,
  productName: string,
): string => `${category}::${material}::${productName.trim().toLowerCase()}`

const csvCell = (value: string | number): string => {
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

/**
 * @description Exports the catalog to CSV. Product ID and SKU are included
 * for reporting only — per spec, they are ignored on the next import and
 * regenerated or matched automatically.
 */
export const exportCatalogCsv = (products: CatalogProduct[]): string => {
  const header = [
    'Product ID',
    'SKU',
    'Category',
    'Material',
    'Product Name',
    'Size',
    'Price',
    'Cost',
    'Status',
  ]
  const rows: string[] = [header.join(',')]

  for (const product of products) {
    for (const variant of product.variants) {
      rows.push(
        [
          product.productId,
          variant.sku,
          product.category,
          product.material === 'fresh' ? 'Fresh' : 'Artificial',
          product.name,
          variant.size,
          variant.price,
          variant.cost ?? '',
          variant.status,
        ]
          .map(csvCell)
          .join(','),
      )
    }
  }

  return rows.join('\n')
}
