sap.ui.define(['exports'], function (exports) { 'use strict';

	const roots = new Map();
	let useLinks = false;
	let preloadLinks = true;
	const setPackageCSSRoot = (packageName, root) => {
		roots.set(packageName, root);
	};
	const getUrl = (packageName, path) => {
		return `${roots.get(packageName)}${path}`;
	};
	const setUseLinks = use => {
		useLinks = use;
	};
	const setPreloadLinks = preload => {
		preloadLinks = preload;
	};
	const shouldUseLinks = () => {
		return useLinks;
	};
	const shouldPreloadLinks = () => {
		return preloadLinks;
	};

	exports.getUrl = getUrl;
	exports.setPackageCSSRoot = setPackageCSSRoot;
	exports.setPreloadLinks = setPreloadLinks;
	exports.setUseLinks = setUseLinks;
	exports.shouldPreloadLinks = shouldPreloadLinks;
	exports.shouldUseLinks = shouldUseLinks;

	Object.defineProperty(exports, '__esModule', { value: true });

});
