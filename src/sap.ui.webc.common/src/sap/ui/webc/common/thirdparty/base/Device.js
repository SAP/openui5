sap.ui.define(['exports'], function (exports) { 'use strict';

	const ua = navigator.userAgent;
	const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
	const ie = /(msie|trident)/i.test(ua);
	const chrome = !ie && /(Chrome|CriOS)/.test(ua);
	const safari = !ie && !chrome && /(Version|PhantomJS)\/(\d+\.\d+).*Safari/.test(ua);
	const webkit = !ie && /webkit/.test(ua);
	const windows = navigator.platform.indexOf("Win") !== -1;
	const android = !windows && /Android/.test(ua);
	const androidPhone = android && /(?=android)(?=.*mobile)/i.test(ua);
	const ipad = /ipad/i.test(ua);
	let windowsVersion;
	let webkitVersion;
	let tablet;
	const isWindows8OrAbove = () => {
		if (!windows) {
			return false;
		}
		if (windowsVersion === undefined) {
			const matches = ua.match(/Windows NT (\d+).(\d)/);
			windowsVersion = matches ? parseFloat(matches[1]) : 0;
		}
		return windowsVersion >= 8;
	};
	const isWebkit537OrAbove = () => {
		if (!webkit) {
			return false;
		}
		if (webkitVersion === undefined) {
			const matches = ua.match(/(webkit)[ /]([\w.]+)/);
			webkitVersion = matches ? parseFloat(matches[1]) : 0;
		}
		return webkitVersion >= 537.10;
	};
	const detectTablet = () => {
		if (tablet !== undefined) {
			return;
		}
		if (ipad) {
			tablet = true;
			return;
		}
		if (touch) {
			if (isWindows8OrAbove()) {
				tablet = true;
				return;
			}
			if (chrome && android) {
				tablet = !/Mobile Safari\/[.0-9]+/.test(ua);
				return;
			}
			let densityFactor = window.devicePixelRatio ? window.devicePixelRatio : 1;
			if (android && isWebkit537OrAbove()) {
				densityFactor = 1;
			}
			tablet = (Math.min(window.screen.width / densityFactor, window.screen.height / densityFactor) >= 600);
			return;
		}
		tablet = (ie && ua.indexOf("Touch") !== -1) || (android && !androidPhone);
	};
	const supportsTouch = () => touch;
	const isIE = () => ie;
	const isSafari = () => safari;
	const isChrome = () => chrome;
	const isTablet = () => {
		detectTablet();
		return (touch || isWindows8OrAbove()) && tablet;
	};
	const isPhone = () => {
		detectTablet();
		return touch && !tablet;
	};
	const isDesktop = () => {
		return (!isTablet() && !isPhone()) || isWindows8OrAbove();
	};

	exports.isChrome = isChrome;
	exports.isDesktop = isDesktop;
	exports.isIE = isIE;
	exports.isPhone = isPhone;
	exports.isSafari = isSafari;
	exports.isTablet = isTablet;
	exports.supportsTouch = supportsTouch;

	Object.defineProperty(exports, '__esModule', { value: true });

});
