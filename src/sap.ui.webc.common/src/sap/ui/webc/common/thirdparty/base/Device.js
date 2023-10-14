sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.supportsTouch = _exports.isTablet = _exports.isSafari = _exports.isPhone = _exports.isMac = _exports.isIOS = _exports.isIE = _exports.isFirefox = _exports.isDesktop = _exports.isCombi = _exports.isChrome = _exports.isAndroid = void 0;
  const isSSR = typeof document === "undefined";
  const internals = {
    get userAgent() {
      if (isSSR) {
        return "";
      }
      return navigator.userAgent;
    },
    get touch() {
      if (isSSR) {
        return false;
      }
      return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    },
    get ie() {
      if (isSSR) {
        return false;
      }
      return /(msie|trident)/i.test(internals.userAgent);
    },
    get chrome() {
      if (isSSR) {
        return false;
      }
      return !internals.ie && /(Chrome|CriOS)/.test(internals.userAgent);
    },
    get firefox() {
      if (isSSR) {
        return false;
      }
      return /Firefox/.test(internals.userAgent);
    },
    get safari() {
      if (isSSR) {
        return false;
      }
      return !internals.ie && !internals.chrome && /(Version|PhantomJS)\/(\d+\.\d+).*Safari/.test(internals.userAgent);
    },
    get webkit() {
      if (isSSR) {
        return false;
      }
      return !internals.ie && /webkit/.test(internals.userAgent);
    },
    get windows() {
      if (isSSR) {
        return false;
      }
      return navigator.platform.indexOf("Win") !== -1;
    },
    get macOS() {
      if (isSSR) {
        return false;
      }
      return !!navigator.userAgent.match(/Macintosh|Mac OS X/i);
    },
    get iOS() {
      if (isSSR) {
        return false;
      }
      return !!navigator.platform.match(/iPhone|iPad|iPod/) || !!(internals.userAgent.match(/Mac/) && "ontouchend" in document);
    },
    get android() {
      if (isSSR) {
        return false;
      }
      return !internals.windows && /Android/.test(internals.userAgent);
    },
    get androidPhone() {
      if (isSSR) {
        return false;
      }
      return internals.android && /(?=android)(?=.*mobile)/i.test(internals.userAgent);
    },
    get ipad() {
      if (isSSR) {
        return false;
      }
      // With iOS 13 the string 'iPad' was removed from the user agent string through a browser setting, which is applied on all sites by default:
      // "Request Desktop Website -> All websites" (for more infos see: https://forums.developer.apple.com/thread/119186).
      // Therefore the OS is detected as MACINTOSH instead of iOS and the device is a tablet if the Device.support.touch is true.
      return /ipad/i.test(internals.userAgent) || /Macintosh/i.test(internals.userAgent) && "ontouchend" in document;
    }
  };
  let windowsVersion;
  let webkitVersion;
  let tablet;
  const isWindows8OrAbove = () => {
    if (isSSR) {
      return false;
    }
    if (!internals.windows) {
      return false;
    }
    if (windowsVersion === undefined) {
      const matches = internals.userAgent.match(/Windows NT (\d+).(\d)/);
      windowsVersion = matches ? parseFloat(matches[1]) : 0;
    }
    return windowsVersion >= 8;
  };
  const isWebkit537OrAbove = () => {
    if (isSSR) {
      return false;
    }
    if (!internals.webkit) {
      return false;
    }
    if (webkitVersion === undefined) {
      const matches = internals.userAgent.match(/(webkit)[ /]([\w.]+)/);
      webkitVersion = matches ? parseFloat(matches[1]) : 0;
    }
    return webkitVersion >= 537.10;
  };
  const detectTablet = () => {
    if (isSSR) {
      return false;
    }
    if (tablet !== undefined) {
      return;
    }
    if (internals.ipad) {
      tablet = true;
      return;
    }
    if (internals.touch) {
      if (isWindows8OrAbove()) {
        tablet = true;
        return;
      }
      if (internals.chrome && internals.android) {
        tablet = !/Mobile Safari\/[.0-9]+/.test(internals.userAgent);
        return;
      }
      let densityFactor = window.devicePixelRatio ? window.devicePixelRatio : 1; // may be undefined in Windows Phone devices
      if (internals.android && isWebkit537OrAbove()) {
        densityFactor = 1;
      }
      tablet = Math.min(window.screen.width / densityFactor, window.screen.height / densityFactor) >= 600;
      return;
    }
    tablet = internals.ie && internals.userAgent.indexOf("Touch") !== -1 || internals.android && !internals.androidPhone;
  };
  const supportsTouch = () => internals.touch;
  _exports.supportsTouch = supportsTouch;
  const isIE = () => internals.ie;
  _exports.isIE = isIE;
  const isSafari = () => internals.safari;
  _exports.isSafari = isSafari;
  const isChrome = () => internals.chrome;
  _exports.isChrome = isChrome;
  const isFirefox = () => internals.firefox;
  _exports.isFirefox = isFirefox;
  const isTablet = () => {
    detectTablet();
    return (internals.touch || isWindows8OrAbove()) && tablet;
  };
  _exports.isTablet = isTablet;
  const isPhone = () => {
    detectTablet();
    return internals.touch && !tablet;
  };
  _exports.isPhone = isPhone;
  const isDesktop = () => {
    if (isSSR) {
      return false;
    }
    return !isTablet() && !isPhone() || isWindows8OrAbove();
  };
  _exports.isDesktop = isDesktop;
  const isCombi = () => {
    return isTablet() && isDesktop();
  };
  _exports.isCombi = isCombi;
  const isIOS = () => {
    return internals.iOS;
  };
  _exports.isIOS = isIOS;
  const isMac = () => {
    return internals.macOS;
  };
  _exports.isMac = isMac;
  const isAndroid = () => {
    return internals.android || internals.androidPhone;
  };
  _exports.isAndroid = isAndroid;
});