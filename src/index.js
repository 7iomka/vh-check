'use strict'

import getOptions from './options'

function noop() {}

function updateCssVar(cssVarName, result) {
  document.documentElement.style.setProperty(
    '--' + cssVarName,
    result.value + 'px'
  )
}

export default function vhCheck(options) {
  options = Object.freeze(getOptions(options))
  var result = options.method()
  result.recompute = options.method
  result.unbind = noop
  // usefulness check
  if (!result.isNeeded && !options.force) {
    return result
  }
  updateCssVar(options.cssVarName, result)

  function onWindowChange() {
    var result = options.method()
    updateCssVar(options.cssVarName, result)
  }

  // listen for orientation change
  // - this can't be configured
  // - because it's convenient and not a real performance bottleneck
  window.addEventListener('orientationchange', onWindowChange, false)
  result.unbind = function unbindOrientationchange() {
    window.removeEventListener('orientationchange', onWindowChange)
  }

  // listen to touch move for scrolling
  // - listening to scrolling can be expansive…
  if (options.updateOnScroll) {
    document.body.addEventListener('touchmove', onWindowChange, false)
    result.unbind = function unbindOrientationchange() {
      window.removeEventListener('orientationchange', onWindowChange)
      document.body.removeEventListener('touchmove', onWindowChange)
    }
  }

  return result
}
