sap.ui.define(['require', 'sap/ui/webc/common/thirdparty/base/asset-registries/Themes'], function (require, Themes) { 'use strict';

	const loadThemeProperties = async (themeName) => {
		switch (themeName) {
			case "sap_belize": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-960661a2'], resolve, reject) })).default;
			case "sap_belize_hcb": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-dad15cff'], resolve, reject) })).default;
			case "sap_belize_hcw": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-009092b4'], resolve, reject) })).default;
			case "sap_fiori_3": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-1070887a'], resolve, reject) })).default;
			case "sap_fiori_3_dark": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-ea45f868'], resolve, reject) })).default;
			case "sap_fiori_3_hcb": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-f1b9a40b'], resolve, reject) })).default;
			case "sap_fiori_3_hcw": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-0a1eda50'], resolve, reject) })).default;
			case "sap_horizon": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-e0128df2'], resolve, reject) })).default;
			case "sap_horizon_exp": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-16cdd4d5'], resolve, reject) })).default;
			default: throw "unknown theme"
		}
	};
	const loadAndCheck = async (themeName) => {
		const data = await loadThemeProperties(themeName);
		if (typeof data === "string" && data.endsWith(".json")) {
			throw new Error(`[themes] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build or use 'import ".../Assets-static.js"'. Check the "Assets" documentation for more information.`);
		}
		return data;
	};
	["sap_belize", "sap_belize_hcb", "sap_belize_hcw", "sap_fiori_3", "sap_fiori_3_dark", "sap_fiori_3_hcb", "sap_fiori_3_hcw", "sap_horizon", "sap_horizon_exp"]
	  .forEach(themeName => Themes.registerThemePropertiesLoader("@ui5/webcomponents-theming", themeName, loadAndCheck));

});
