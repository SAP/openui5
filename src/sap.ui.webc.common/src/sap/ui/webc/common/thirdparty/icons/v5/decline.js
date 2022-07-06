sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "decline";
	const pathData = "M292 256l117 117q7 7 7 18t-7 18-19 7q-11 0-18-7L256 293 140 409q-7 7-18 7-12 0-19-7t-7-18 7-18l117-117-117-116q-7-7-7-18t7-18q8-8 19-8 10 0 18 8l116 116 116-116q8-8 18-8 11 0 19 8 7 7 7 18t-7 18z";
	const ltr = false;
	const accData = i18nDefaults.ICON_DECLINE;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var decline = "decline";

	exports.accData = accData;
	exports.default = decline;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
