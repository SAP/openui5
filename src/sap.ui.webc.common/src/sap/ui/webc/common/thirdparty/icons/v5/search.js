sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "search";
	const pathData = "M488 435q8 8 8 19 0 10-8 18-7 8-19 8-11 0-18-8l-91-90q-57 45-131 45-44 0-82.5-17T79 364t-46-67.5T16 214t17-83 46-68 67.5-46T229 0t83 17 68 46 46 68 17 83q0 73-46 130zM69 214q0 33 12.5 62t34.5 51 51 34.5 62 12.5 62-12.5 51-34.5 34.5-51 12.5-62-12.5-62-34.5-51-51-34.5T229 54t-62 12.5-51 34.5-34.5 51T69 214z";
	const ltr = true;
	const accData = i18nDefaults.ICON_SEARCH;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var search = "search";

	exports.accData = accData;
	exports.default = search;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
