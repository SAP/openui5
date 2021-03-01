sap.ui.define(['exports', '../locale/languageChange', '../locale/getLocale', '../generated/AssetParameters', '../FeaturesRegistry'], function (exports, languageChange, getLocale, AssetParameters, FeaturesRegistry) { 'use strict';

	const localeDataMap = new Map();
	const loaders = new Map();
	const cldrPromises = new Map();
	const reportedErrors = new Set();
	let warningShown = false;
	const M_ISO639_OLD_TO_NEW = {
		"iw": "he",
		"ji": "yi",
		"in": "id",
		"sh": "sr",
	};
	const _showAssetsWarningOnce = localeId => {
		if (!warningShown) {
			console.warn(`[LocaleData] Supported locale "${localeId}" not configured, import the "Assets.js" module from the webcomponents package you are using.`);
			warningShown = true;
		}
	};
	const calcLocale = (language, region, script) => {
		language = (language && M_ISO639_OLD_TO_NEW[language]) || language;
		if (language === "no") {
			language = "nb";
		}
		if (language === "zh" && !region) {
			if (script === "Hans") {
				region = "CN";
			} else if (script === "Hant") {
				region = "TW";
			}
		}
		let localeId = `${language}_${region}`;
		if (AssetParameters.SUPPORTED_LOCALES.includes(localeId)) {
			if (loaders.has(localeId)) {
				return localeId;
			}
			_showAssetsWarningOnce(localeId);
			return AssetParameters.DEFAULT_LOCALE;
		}
		localeId = language;
		if (AssetParameters.SUPPORTED_LOCALES.includes(localeId)) {
			if (loaders.has(localeId)) {
				return localeId;
			}
			_showAssetsWarningOnce(localeId);
			return AssetParameters.DEFAULT_LOCALE;
		}
		return AssetParameters.DEFAULT_LOCALE;
	};
	const setLocaleData = (localeId, content) => {
		localeDataMap.set(localeId, content);
	};
	const getLocaleData = localeId => {
		if (!loaders.has(localeId)) {
			localeId = AssetParameters.DEFAULT_LOCALE;
		}
		const content = localeDataMap.get(localeId);
		if (!content) {
			throw new Error(`CLDR data for locale ${localeId} is not loaded!`);
		}
		return content;
	};
	const _loadCldrOnce = localeId => {
		const loadCldr = loaders.get(localeId);
		if (!cldrPromises.get(localeId)) {
			cldrPromises.set(localeId, loadCldr(localeId));
		}
		return cldrPromises.get(localeId);
	};
	const fetchCldr = async (language, region, script) => {
		const localeId = calcLocale(language, region, script);
		const OpenUI5Support = FeaturesRegistry.getFeature("OpenUI5Support");
		if (OpenUI5Support) {
			const cldrContent = OpenUI5Support.getLocaleDataObject();
			if (cldrContent) {
				setLocaleData(localeId, cldrContent);
				return;
			}
		}
		try {
			const cldrContent = await _loadCldrOnce(localeId);
			setLocaleData(localeId, cldrContent);
		} catch (e) {
			if (!reportedErrors.has(e.message)) {
				reportedErrors.add(e.message);
				console.error(e.message);
			}
		}
	};
	const registerLocaleDataLoader = (localeId, loader) => {
		loaders.set(localeId, loader);
	};
	registerLocaleDataLoader("en", async runtimeLocaleId => {
		return (await fetch(`https://ui5.sap.com/1.60.2/resources/sap/ui/core/cldr/en.json`)).json();
	});
	languageChange.attachLanguageChange(() => {
		const locale = getLocale();
		return fetchCldr(locale.getLanguage(), locale.getRegion(), locale.getScript());
	});

	exports.fetchCldr = fetchCldr;
	exports.getLocaleData = getLocaleData;
	exports.registerLocaleDataLoader = registerLocaleDataLoader;

	Object.defineProperty(exports, '__esModule', { value: true });

});
