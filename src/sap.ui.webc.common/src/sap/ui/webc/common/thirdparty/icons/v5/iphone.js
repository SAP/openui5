sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "iphone";
	const pathData = "M360.917 1q32 0 54 22t20 54v358q0 32-22 54.5t-55 22.5h-204q-32 0-54.5-22.5t-22.5-54.5V77q0-32 22.5-54t54.5-22h207zm26 76q0-11-7.5-18t-18.5-7h-20q-8 0-13.5 4.5t-9.5 10.5l-11 23q-7 15-23 15h-51q-8 0-13.5-4.5t-9.5-10.5l-10-23q-7-15-23-15h-20q-26 0-26 25v358q0 11 7 18.5t19 7.5h204q11 0 18.5-7.5t7.5-18.5V77z";
	const ltr = false;
	const accData = i18nDefaults.ICON_IPHONE;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var iphone = "iphone";

	exports.accData = accData;
	exports.default = iphone;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
