sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "up";
	const pathData = "M254 137L79 423h351zm253 329q-10 14-26 14H28q-9 0-16-4.5T2 466q-3-8-1-15t7-14L235 68q3-6 9.5-10t12.5-4q13 0 23 14l227 369q10 14 0 29z";
	const ltr = false;
	const accData = i18nDefaults.ICON_UP;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var up = "up";

	exports.accData = accData;
	exports.default = up;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
