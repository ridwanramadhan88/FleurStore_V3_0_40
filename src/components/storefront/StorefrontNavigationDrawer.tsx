import type { FC } from 'react'
import { ChevronRight } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onOpenCategories: () => void
  onOpenAllFlowers: () => void
}

export const StorefrontNavigationDrawer: FC<Props> = ({
  open,
  onClose,
  onOpenCategories,
  onOpenAllFlowers,
}) => (
  <div
    className={`storefront-navigation-layer ${open ? 'storefront-navigation-layer--open' : ''}`}
    aria-hidden={!open}
  >
    <button
      type="button"
      className="storefront-navigation-backdrop"
      onClick={onClose}
      aria-label="Close navigation menu"
      tabIndex={open ? 0 : -1}
    />

    <aside
      className="storefront-navigation-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Store navigation"
    >
      <div className="storefront-navigation-drawer__content no-scrollbar">
        <div className="storefront-navigation-drawer__heading">
          <h2 className="font-display text-[2.7rem] font-medium leading-[0.92] sm:text-[2.95rem] lg:text-[3.35rem]">
            Explore
          </h2>
        </div>

        <nav aria-label="Store navigation" className="storefront-navigation-list">
          <button
            type="button"
            className="storefront-navigation-parent flex w-full items-center justify-between gap-4"
            onClick={onOpenCategories}
          >
            <span>Categories</span>
            <ChevronRight className="size-5 shrink-0" strokeWidth={1.9} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="storefront-navigation-parent"
            onClick={onOpenAllFlowers}
          >
            All Flowers
          </button>
        </nav>
      </div>
    </aside>
  </div>
)
