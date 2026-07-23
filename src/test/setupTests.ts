import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useUserStore } from '../store/userStore'


// Store-level tests that do not explicitly set a session use the normal
// scheduled Admin branch. Tests for the off-shift/no-branch case set
// branchId: undefined explicitly.
beforeEach(() => {
  const user = useUserStore.getState()
  if (user.role === 'admin' && !user.branchId) {
    useUserStore.setState({ branchId: 'Kedamaian' })
  }
})

if (typeof HTMLElement !== 'undefined') {
  Object.defineProperties(HTMLElement.prototype, {
    hasPointerCapture: {
      configurable: true,
      value: () => false,
    },
    setPointerCapture: {
      configurable: true,
      value: () => undefined,
    },
    releasePointerCapture: {
      configurable: true,
      value: () => undefined,
    },
    scrollIntoView: {
      configurable: true,
      value: () => undefined,
    },
  })

  afterEach(() => cleanup())
}

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  value: TestResizeObserver,
})

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: () => undefined,
  })
}
