sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "ipad";
	const pathData = "M395.5 1q29 0 49.5 20t20.5 50v371q0 30-20.5 50t-49.5 20h-279q-29 0-49-20t-20-50V71q0-30 20-50t49-20h279zm23 441V71h-325v371h325z";
	const ltr = false;
	const accData = i18nDefaults.ICON_IPAD;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var ipad = "ipad";

	exports.accData = accData;
	exports.default = ipad;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
