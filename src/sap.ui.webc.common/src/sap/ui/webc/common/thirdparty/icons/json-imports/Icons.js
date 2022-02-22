sap.ui.define(['require', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (require, Icons) { 'use strict';

	const loadIconsBundle = async (collection) => {
	    let iconData = null;
		if (collection === "SAP-icons-v5") {
			iconData = (await new Promise(function (resolve, reject) { require(['../_chunks/SAP-icons'], resolve, reject) })).default;
		} else {
			iconData = (await new Promise(function (resolve, reject) { require(['../_chunks/SAP-icons2'], resolve, reject) })).default;
		}
	    if (typeof iconData === "string" && iconData.endsWith(".json")) {
	        throw new Error("[icons] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build or use `import \"@ui5/webcomponents-icons/dist/Assets-static.js\". Check the \"Assets\" documentation for more information.");
	    }
	    return iconData;
	};
	const registerLoaders = () => {
		Icons.registerIconLoader("SAP-icons", loadIconsBundle);
		Icons.registerIconLoader("SAP-icons-v5", loadIconsBundle);
	};
	registerLoaders();

});
