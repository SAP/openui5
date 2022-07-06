sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "filter";
	const pathData = "M507.417 50q5 9 4 17.5t-4 13.5l-153 214v118q0 10-5.5 17t-13.5 12l-127 64q-17 10-32 0-16-11-16-29V295l-153-214q-5-7-6.5-15.5t3.5-15.5q10-16 28-16h447q18 0 28 16zm-92 47h-322l124 173q2 5 4.5 9.5t2.5 9.5v140l63-32V289q0-5 2.5-9.5t4.5-9.5z";
	const ltr = false;
	const accData = i18nDefaults.ICON_FILTER;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var filter = "filter";

	exports.accData = accData;
	exports.default = filter;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
