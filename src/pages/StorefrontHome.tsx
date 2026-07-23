import type { FC } from 'react'
import heroFlowerArtwork from '../assets/storefront-home/main-artwork-group.svg'
import { StorefrontHeader } from '../components/storefront/StorefrontHeader'

interface Props {
  cartCount: number
  onOpenCart: () => void
  onOpenCategories: () => void
  onOpenHome: () => void
  onOpenSearch: () => void
  onToggleMenu: () => void
  menuOpen: boolean
}

/** Poster-style storefront landing page reconstructed from the supplied mockup. */
export const StorefrontHome: FC<Props> = ({
  cartCount,
  onOpenCart,
  onOpenCategories,
  onOpenHome,
  onOpenSearch,
  onToggleMenu,
  menuOpen,
}) => (
  <main className="storefront-home" aria-label="Fleurstales online flower store">
    <StorefrontHeader
      cartCount={cartCount}
      onOpenCart={onOpenCart}
      onOpenHome={onOpenHome}
      onOpenSearch={onOpenSearch}
      onToggleMenu={onToggleMenu}
      menuOpen={menuOpen}
    />

    <div className="storefront-home__poster">
      <img
        className="storefront-home__flower"
        src={heroFlowerArtwork}
        alt=""
        aria-hidden="true"
      />

      <div className="storefront-home__headline">
        <span className="storefront-home__headline-line">You’ll get</span>
        <span className="storefront-home__headline-line storefront-home__headline-line--accent">Flowers</span>
        <span className="storefront-home__headline-line">Today!</span>
      </div>

      <button
        type="button"
        className="storefront-home__hero-shop tap-scale"
        onClick={onOpenCategories}
        aria-label="Open flower categories"
      >
        <span>Shop</span>
        <span className="storefront-home__hero-shop-arrow" aria-hidden="true">→</span>
      </button>
    </div>
  </main>
)

export default StorefrontHome
