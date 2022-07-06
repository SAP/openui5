sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "iphone";
	const pathData = "M352 0q26 0 45 19t19 45v384q0 27-19 45.5T352 512H160q-26 0-45-18.5T96 448V64q0-26 19-45t45-19h192zm32 64H128v352h256V64zM256 480q10 0 17-6.5t7-17.5q0-10-7-17t-17-7-17 7-7 17q0 11 7 17.5t17 6.5z";
	const ltr = false;
	const accData = i18nDefaults.ICON_IPHONE;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var iphone = "iphone";

	exports.accData = accData;
	exports.default = iphone;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
