sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "refresh";
	const pathData = "M478 320q-6 41-25.5 76T404 456.5 337.5 497 257 512q-46 0-86.5-17.5t-71-48-48-71T34 288q0-45 16.5-85T96 133t68-48 84-20h61q26 0 60-1l-41-36q-5-5-5-11.5T328 5t11-5 11 5l58 51q9 10 9 23t-9 23l-57 54q-5 5-11 5t-11-5-5-11.5 5-11.5l40-37H257q-40 0-74.5 15T122 152t-41 61-15 75 15 75 41 61 60.5 41 74.5 15q36 0 68-12t56.5-33.5T423 384t23-64h32z";
	const ltr = false;
	const accData = i18nDefaults.ICON_REFRESH;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var refresh = "refresh";

	exports.accData = accData;
	exports.default = refresh;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
