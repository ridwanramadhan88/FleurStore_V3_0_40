import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { StorefrontPage } from './Storefront'

describe('storefront product detail page', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/shop?arrangement=Bouquets')
  })

  it('opens a dedicated product URL instead of a drawer', async () => {
    const user = userEvent.setup()
    render(<StorefrontPage />)

    const productButtons = screen.getAllByRole('button').filter((button) =>
      button.textContent?.includes('Hand Bouquet'),
    )
    await user.click(productButtons[0])

    expect(window.location.pathname).toMatch(/^\/shop\/product\//)
    expect(screen.getByRole('button', { name: 'Back to shop' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    expect(screen.getAllByText(/Fresh flower|Artificial flower/).length).toBeGreaterThan(0)
  })
})

it('shows a product-not-found state for an invalid direct product URL', () => {
  window.history.replaceState({}, '', '/shop/product/DOES-NOT-EXIST')
  render(<StorefrontPage />)

  expect(screen.getByRole('heading', { name: 'Product not found' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Back to shop' })).toBeInTheDocument()
})
