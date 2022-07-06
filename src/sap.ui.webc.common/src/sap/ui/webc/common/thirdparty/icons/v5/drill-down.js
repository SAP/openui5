sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "drill-down";
	const pathData = "M106 55q-9-10-9-22.5t9-22.5q10-9 22.5-9t22.5 9l105 106L362 10q10-9 22.5-9t22.5 9q9 10 9 22.5T407 55L279 183q-10 10-22.5 10T234 183zm256 115q10-10 22.5-10t22.5 10q9 10 9 22.5t-9 22.5L279 342q-10 10-22.5 10T234 342L106 215q-9-10-9-22.5t9-22.5q10-10 22.5-10t22.5 10l105 105zm0 160q10-10 22.5-10t22.5 10q9 9 9 22t-9 22L279 502q-10 10-22.5 10T234 502L106 374q-9-9-9-22t9-22q10-10 22.5-10t22.5 10l105 105z";
	const ltr = false;
	const accData = i18nDefaults.ICON_DRILL_DOWN;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var drillDown = "drill-down";

	exports.accData = accData;
	exports.default = drillDown;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
