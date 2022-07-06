sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "flag";
	const pathData = "M64 0h32v512H64V0zm307 33q14 0 23.5-2t17-6 16-10T448 0v239q-14 14-30 25-14 9-31 16.5t-35 7.5q-5 0-23-5l-80-22q-19-5-25-5-29 0-51 7.5T128 288V63q10-17 26-31 14-12 33.5-22T235 0q7 0 27 5t42.5 11.5T346 28t25 5z";
	const ltr = true;
	const accData = i18nDefaults.ICON_FLAG;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var flag = "flag";

	exports.accData = accData;
	exports.default = flag;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
