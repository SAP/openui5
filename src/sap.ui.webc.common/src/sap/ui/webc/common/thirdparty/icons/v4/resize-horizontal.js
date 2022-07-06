sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "resize-horizontal";
	const pathData = "M288 16q0-6 4.5-11T304 0t11.5 5 4.5 11v480q0 16-16 16t-16-16V16zm-96 0q0-6 4.5-11T208 0t11.5 5 4.5 11v480q0 16-16 16t-16-16V16zm197 140q-6-6-6-11 0-6 6-12 5-5 11-5t11 5l92 99q9 10 9 23t-9 22l-92 101q-5 5-11.5 5t-11.5-5-5-11.5 5-11.5l87-95q3-3 3-5 0-3-3-6zM37 249q-3 3-3 6 0 2 3 5l87 95q5 5 5 11.5t-5 11.5-11.5 5-11.5-5L9 277q-9-9-9-22t9-23l92-99q5-5 11-5t11 5q6 6 6 12 0 5-6 11z";
	const ltr = false;
	const accData = i18nDefaults.ICON_RESIZE_HORIZONTAL;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var resizeHorizontal = "resize-horizontal";

	exports.accData = accData;
	exports.default = resizeHorizontal;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
