sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "sort-descending";
	const pathData = "M17 96h478l-15 32H34zm431 96l-15 32H82l-17-32h383zm-335 96h287l-16 32H129zm48 96h192l-16 32H177z";
	const ltr = false;
	const accData = i18nDefaults.ICON_SORT_DESCENDING;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var sortDescending = "sort-descending";

	exports.accData = accData;
	exports.default = sortDescending;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
