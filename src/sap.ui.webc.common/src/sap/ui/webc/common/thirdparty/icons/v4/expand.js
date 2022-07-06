sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "expand";
	const pathData = "M22 227l87-95q3-3 3-5 0-3-3-6L23 28q-6-6-6-11 0-6 6-12 5-5 11-5t11 5l92 99q9 10 9 23t-9 22L45 250q-5 5-11 5-4 0-12-5-6-6-6-12t6-11zm58 93v128h384V64H208V32h256q13 0 22.5 9t9.5 23v384q0 13-9.5 22.5T464 480H80q-14 0-23-9.5T48 448V320h32zm176-80V128h32v112h112v32H288v112h-32V272H144v-32h112z";
	const ltr = false;
	const accData = i18nDefaults.ICON_EXPAND;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var expand = "expand";

	exports.accData = accData;
	exports.default = expand;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
