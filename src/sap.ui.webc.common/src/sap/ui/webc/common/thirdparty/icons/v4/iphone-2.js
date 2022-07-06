sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "iphone-2";
	const pathData = "M448 96q26 0 45 18.5t19 45.5v192q0 26-19 45t-45 19H64q-26 0-45-19T0 352V160q0-27 19-45.5T64 96h384zm0 32H96v256h352V128zM56 280q10 0 17-7t7-17-7-17-17-7-17 7-7 17 7 17 17 7z";
	const ltr = false;
	const accData = i18nDefaults.ICON_IPHONE;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var iphone2 = "iphone-2";

	exports.accData = accData;
	exports.default = iphone2;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
