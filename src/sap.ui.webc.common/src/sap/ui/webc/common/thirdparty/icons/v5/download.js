sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "download";
	const pathData = "M472 459q12 0 19.5 8t7.5 19q0 10-7.5 18.5T472 513H41q-13 0-20-8.5T14 486q0-11 7-19t20-8h431zM132 262q-8-8-8-18.5t8-18.5 19-8 19 8l62 62V28q0-12 7.5-19.5T259 1t19.5 7.5T286 28v259l62-62q8-8 19-8t19 8 8 18.5-8 18.5L278 370q-2 2-5.5 4t-5.5 4q-9 5-19 0-7-5-11-8z";
	const ltr = false;
	const accData = i18nDefaults.ICON_DOWNLOAD;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var download = "download";

	exports.accData = accData;
	exports.default = download;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
