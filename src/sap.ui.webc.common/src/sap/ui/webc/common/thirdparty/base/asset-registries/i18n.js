sap.ui.define(['exports', '../locale/getLocale', '../locale/languageChange', '../locale/normalizeLocale', '../locale/nextFallbackLocale', '../generated/AssetParameters', '../config/Language'], function (exports, getLocale, languageChange, normalizeLocale, nextFallbackLocale, AssetParameters, Language) { 'use strict';

	const warningShown = new Set();
	const reportedErrors = new Set();
	const bundleData = new Map();
	const bundlePromises = new Map();
	const loaders = new Map();
	const registerI18nLoader = (packageName, localeId, loader) => {
		const bundleKey = `${packageName}/${localeId}`;
		loaders.set(bundleKey, loader);
	};
	const _setI18nBundleData = (packageName, data) => {
		bundleData.set(packageName, data);
	};
	const getI18nBundleData = packageName => {
		return bundleData.get(packageName);
	};
	const registerI18nBundle = (_packageName, _bundle) => {
		throw new Error("This method has been removed. Use `registerI18nLoader` instead.");
	};
	const _hasLoader = (packageName, localeId) => {
		const bundleKey = `${packageName}/${localeId}`;
		return loaders.has(bundleKey);
	};
	const _loadMessageBundleOnce = (packageName, localeId) => {
		const bundleKey = `${packageName}/${localeId}`;
		const loadMessageBundle = loaders.get(bundleKey);
		if (!bundlePromises.get(bundleKey)) {
			bundlePromises.set(bundleKey, loadMessageBundle(localeId));
		}
		return bundlePromises.get(bundleKey);
	};
	const _showAssetsWarningOnce = packageName => {
		if (!warningShown.has(packageName)) {
			console.warn(`[${packageName}]: Message bundle assets are not configured. Falling back to English texts.`,
			` Add \`import "${packageName}/dist/Assets.js"\` in your bundle and make sure your build tool supports dynamic imports and JSON imports. See section "Assets" in the documentation for more information.`);
			warningShown.add(packageName);
		}
	};
	const fetchI18nBundle = async packageName => {
		const language = getLocale().getLanguage();
		const region = getLocale().getRegion();
		let localeId = normalizeLocale(language + (region ? `-${region}` : ``));
		while (localeId !== AssetParameters.DEFAULT_LANGUAGE && !_hasLoader(packageName, localeId)) {
			localeId = nextFallbackLocale(localeId);
		}
		const fetchDefaultLanguage = Language.getFetchDefaultLanguage();
		if (localeId === AssetParameters.DEFAULT_LANGUAGE && !fetchDefaultLanguage) {
			_setI18nBundleData(packageName, null);
			return;
		}
		if (!_hasLoader(packageName, localeId)) {
			_showAssetsWarningOnce(packageName);
			return;
		}
		try {
			const data = await _loadMessageBundleOnce(packageName, localeId);
			_setI18nBundleData(packageName, data);
		} catch (e) {
			if (!reportedErrors.has(e.message)) {
				reportedErrors.add(e.message);
				console.error(e.message);
			}
		}
	};
	languageChange.attachLanguageChange(() => {
		const allPackages = [...bundleData.keys()];
		return Promise.all(allPackages.map(fetchI18nBundle));
	});

	exports.fetchI18nBundle = fetchI18nBundle;
	exports.getI18nBundleData = getI18nBundleData;
	exports.registerI18nBundle = registerI18nBundle;
	exports.registerI18nLoader = registerI18nLoader;

	Object.defineProperty(exports, '__esModule', { value: true });

});
