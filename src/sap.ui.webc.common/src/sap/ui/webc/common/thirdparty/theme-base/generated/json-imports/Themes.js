sap.ui.define(['require', 'sap/ui/webc/common/thirdparty/base/asset-registries/Themes'], function (require, Themes) { 'use strict';

	const loadThemeProperties = async (themeName) => {
		switch (themeName) {
			case "sap_belize": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-4c3222f0'], resolve, reject) })).default;
			case "sap_belize_hcb": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-10d6a87c'], resolve, reject) })).default;
			case "sap_belize_hcw": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-f92d2591'], resolve, reject) })).default;
			case "sap_fiori_3": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-33240f21'], resolve, reject) })).default;
			case "sap_fiori_3_dark": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-abf4cf1a'], resolve, reject) })).default;
			case "sap_fiori_3_hcb": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-17ba1024'], resolve, reject) })).default;
			case "sap_fiori_3_hcw": return (await new Promise(function (resolve, reject) { require(['../../parameters-bundle.css-354df2bd'], resolve, reject) })).default;
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
	["sap_belize", "sap_belize_hcb", "sap_belize_hcw", "sap_fiori_3", "sap_fiori_3_dark", "sap_fiori_3_hcb", "sap_fiori_3_hcw"]
	  .forEach(themeName => Themes.registerThemePropertiesLoader("@ui5/webcomponents-theme-base", themeName, loadAndCheck));

});
