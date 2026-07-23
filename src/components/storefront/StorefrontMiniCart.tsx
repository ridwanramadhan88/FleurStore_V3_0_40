import { useEffect, useLayoutEffect, useRef, type FC } from 'react'
import { CartBagIcon } from './StorefrontCartIcon'

interface Props {
  count: number
  totalIdr: number
  formatter: Intl.NumberFormat
  onOpen: () => void
  concealed?: boolean
}

export const StorefrontMiniCart: FC<Props> = ({
  count,
  totalIdr,
  formatter,
  onOpen,
  concealed = false,
}) => {
  const isVisible = !concealed
  const underlayReleaseTimerRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const root = document.documentElement
    const body = document.body
    const className = 'storefront-mini-cart-underlay-active'

    if (underlayReleaseTimerRef.current !== null) {
      window.clearTimeout(underlayReleaseTimerRef.current)
      underlayReleaseTimerRef.current = null
    }

    if (isVisible) {
      // Trigger Safari's lower-page underlay on the very first frame of the
      // cart entrance, before the panel has completed its slide transition.
      root.classList.add(className)
      body.classList.add(className)
      return
    }

    if (!root.classList.contains(className)) return

    // Keep the underlay active while the panel slides out, then release it.
    underlayReleaseTimerRef.current = window.setTimeout(() => {
      root.classList.remove(className)
      body.classList.remove(className)
      underlayReleaseTimerRef.current = null
    }, 1080)
  }, [isVisible])

  useEffect(() => () => {
    if (underlayReleaseTimerRef.current !== null) {
      window.clearTimeout(underlayReleaseTimerRef.current)
    }
    document.documentElement.classList.remove('storefront-mini-cart-underlay-active')
    document.body.classList.remove('storefront-mini-cart-underlay-active')
  }, [])

  return (
    <div
      className={`storefront-mini-cart${isVisible ? ' storefront-mini-cart--visible' : ''}`}
      aria-hidden={!isVisible}
    >
      <div className="storefront-mini-cart__panel">
        <div className="storefront-mini-cart__content">
          <div className="storefront-mini-cart__summary">
            <span className="storefront-mini-cart__count">
              {count} {count === 1 ? 'item' : 'items'}
            </span>
            <span className="storefront-mini-cart__price tabular-nums">
              Rp. {formatter.format(totalIdr)}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpen}
            className="storefront-mini-cart__button"
            aria-label={`View cart, ${count} ${count === 1 ? 'item' : 'items'}`}
            tabIndex={isVisible ? 0 : -1}
          >
            <CartBagIcon tone="light" className="h-auto w-5" />
            <span>View cart</span>
          </button>
        </div>
      </div>
    </div>
  )
}
