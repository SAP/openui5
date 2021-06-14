sap.ui.define(['exports', './thirdparty/merge', './FeaturesRegistry', './generated/AssetParameters'], function (exports, merge, FeaturesRegistry, AssetParameters) { 'use strict';

	let initialized = false;
	let initialConfig = {
		animationMode: "full",
		theme: AssetParameters.DEFAULT_THEME,
		rtl: null,
		language: null,
		calendarType: null,
		noConflict: false,
		formatSettings: {},
		fetchDefaultLanguage: false,
		assetsPath: "",
	};
	const getAnimationMode = () => {
		initConfiguration();
		return initialConfig.animationMode;
	};
	const getTheme = () => {
		initConfiguration();
		return initialConfig.theme;
	};
	const getRTL = () => {
		initConfiguration();
		return initialConfig.rtl;
	};
	const getLanguage = () => {
		initConfiguration();
		return initialConfig.language;
	};
	const getFetchDefaultLanguage = () => {
		initConfiguration();
		return initialConfig.fetchDefaultLanguage;
	};
	const getNoConflict = () => {
		initConfiguration();
		return initialConfig.noConflict;
	};
	const getCalendarType = () => {
		initConfiguration();
		return initialConfig.calendarType;
	};
	const getFormatSettings = () => {
		initConfiguration();
		return initialConfig.formatSettings;
	};
	const getAssetsPath = () => {
		initConfiguration();
		return initialConfig.assetsPath;
	};
	const booleanMapping = new Map();
	booleanMapping.set("true", true);
	booleanMapping.set("false", false);
	const parseConfigurationScript = () => {
		const configScript = document.querySelector("[data-ui5-config]") || document.querySelector("[data-id='sap-ui-config']");
		let configJSON;
		if (configScript) {
			try {
				configJSON = JSON.parse(configScript.innerHTML);
			} catch (err) {
				console.warn("Incorrect data-sap-ui-config format. Please use JSON");
			}
			if (configJSON) {
				initialConfig = merge(initialConfig, configJSON);
			}
		}
	};
	const parseURLParameters = () => {
		const params = new URLSearchParams(window.location.search);
		params.forEach((value, key) => {
			const parts = key.split("sap-").length;
			if (parts === 0 || parts === key.split("sap-ui-").length) {
				return;
			}
			applyURLParam(key, value, "sap");
		});
		params.forEach((value, key) => {
			if (!key.startsWith("sap-ui")) {
				return;
			}
			applyURLParam(key, value, "sap-ui");
		});
	};
	const applyURLParam = (key, value, paramType) => {
		const lowerCaseValue = value.toLowerCase();
		const param = key.split(`${paramType}-`)[1];
		if (booleanMapping.has(value)) {
			value = booleanMapping.get(lowerCaseValue);
		}
		initialConfig[param] = value;
	};
	const applyOpenUI5Configuration = () => {
		const OpenUI5Support = FeaturesRegistry.getFeature("OpenUI5Support");
		if (!OpenUI5Support || !OpenUI5Support.isLoaded()) {
			return;
		}
		const OpenUI5Config = OpenUI5Support.getConfigurationSettingsObject();
		initialConfig = merge(initialConfig, OpenUI5Config);
	};
	const initConfiguration = () => {
		if (initialized) {
			return;
		}
		parseConfigurationScript();
		parseURLParameters();
		applyOpenUI5Configuration();
		initialized = true;
	};

	exports.getAnimationMode = getAnimationMode;
	exports.getAssetsPath = getAssetsPath;
	exports.getCalendarType = getCalendarType;
	exports.getFetchDefaultLanguage = getFetchDefaultLanguage;
	exports.getFormatSettings = getFormatSettings;
	exports.getLanguage = getLanguage;
	exports.getNoConflict = getNoConflict;
	exports.getRTL = getRTL;
	exports.getTheme = getTheme;

	Object.defineProperty(exports, '__esModule', { value: true });

});
