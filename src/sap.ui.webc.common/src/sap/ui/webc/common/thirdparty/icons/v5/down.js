sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "down";
	const pathData = "M506.5 69q5 6 5 16 0 8-4 13l-226 368q-9 14-23 14t-23-14L9.5 98q-7-11-7-20 0-5 1-8 7-14 26-14h453q16 0 24 13zm-75 43h-351l175 286z";
	const ltr = false;
	const accData = i18nDefaults.ICON_DOWN;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var down = "down";

	exports.accData = accData;
	exports.default = down;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
