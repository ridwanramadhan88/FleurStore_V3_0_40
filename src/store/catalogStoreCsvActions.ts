/**
 * @file catalogStoreCsvActions.ts
 * @description CSV import/export actions for the Catalog store. Row parsing,
 * matching, and serialization rules live in domain/catalogCsvDomain.ts —
 * this file only drives the create/update decisions against store state and
 * reuses catalogStoreProductActions' buildProduct/allSkus/allProductIds so
 * new products created via import are assembled identically to ones created
 * through the form.
 */

import type {
  CatalogMaterial,
  CatalogStoreGet,
  CatalogStoreSet,
  CatalogStoreState,
  CatalogVariant,
  CsvImportSummary,
} from './catalogStoreTypes'
import { generateCategoryPrefix, generateSku } from '../domain/catalogIdDomain'
import {
  exportCatalogCsv,
  parseCatalogCsv,
  productMatchKey,
} from '../domain/catalogCsvDomain'
import { allProductIds, allSkus, buildProduct } from './catalogStoreProductActions'
import { generateId } from '../lib/id'
import { isSectionEditAuthorized } from '../config/authorization'

type CsvActions = Pick<CatalogStoreState, 'importCsv' | 'exportCsv'>

export const createCatalogCsvActions = (
  set: CatalogStoreSet,
  get: CatalogStoreGet,
): CsvActions => ({
  importCsv: (csvText) => {
    if (!isSectionEditAuthorized('catalog')) return { createdProducts: 0, updatedProducts: 0, createdVariants: 0, updatedVariants: 0, errors: [{ row: 0, message: 'This account cannot edit the catalog.' }] }
    const categoryNames = get().categories.map((category) => category.name)
    const { rows, errors } = parseCatalogCsv(csvText, categoryNames)
    const summary: CsvImportSummary = {
      createdProducts: 0,
      updatedProducts: 0,
      createdVariants: 0,
      updatedVariants: 0,
      errors,
    }

    set((state) => {
      let products = [...state.products]
      const deletedProductIds = state.deletedProductIds
      const touchedProducts = new Set<string>()
      const prefixForCategory = (category: string): string =>
        state.categories.find((c) => c.name === category)?.prefix ??
        generateCategoryPrefix(category, [])

      for (const row of rows) {
        const key = productMatchKey(row.category, row.material, row.productName)
        const existingIndex = products.findIndex(
          (product) =>
            productMatchKey(product.category, product.material, product.name) === key,
        )

        if (existingIndex === -1) {
          // Create new product + first variant.
          const newProduct = buildProduct(
            {
              category: row.category,
              material: row.material as CatalogMaterial,
              name: row.productName,
              isActive: true,
              variants: [
                {
                  size: row.size,
                  price: row.price,
                  status: 'active',
                },
              ],
            },
            prefixForCategory(row.category),
            allProductIds(products, deletedProductIds),
            allSkus(products),
          )
          products = [...products, newProduct]
          summary.createdProducts += 1
          summary.createdVariants += 1
          touchedProducts.add(newProduct.id)
          continue
        }

        const existing = products[existingIndex]
        if (!touchedProducts.has(existing.id)) {
          summary.updatedProducts += 1
          touchedProducts.add(existing.id)
        }

        const variantIndex = existing.variants.findIndex(
          (variant) => variant.size.toLowerCase() === row.size.toLowerCase(),
        )

        if (variantIndex === -1) {
          const sku = generateSku(
            prefixForCategory(existing.category),
            existing.material,
            existing.name,
            row.size,
            allSkus(products),
          )
          const newVariant: CatalogVariant = {
            id: generateId('var'),
            sku,
            size: row.size,
            price: row.price,
            status: 'active',
          }
          const updated = { ...existing, variants: [...existing.variants, newVariant] }
          products = products.map((product, index) =>
            index === existingIndex ? updated : product,
          )
          summary.createdVariants += 1
        } else {
          const updatedVariant = {
            ...existing.variants[variantIndex],
            price: row.price,
          }
          const updated = {
            ...existing,
            variants: existing.variants.map((variant, index) =>
              index === variantIndex ? updatedVariant : variant,
            ),
          }
          products = products.map((product, index) =>
            index === existingIndex ? updated : product,
          )
          summary.updatedVariants += 1
        }
      }

      return { products }
    })

    return summary
  },

  exportCsv: () => exportCatalogCsv(get().products),
})
