sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "resize-horizontal";
	const pathData = "M288 16q0-6 4.5-11T304 0t11.5 5 4.5 11v480q0 16-16 16t-16-16V16zm-96 0q0-6 4.5-11T208 0t11.5 5 4.5 11v480q0 16-16 16t-16-16V16zm197 140q-12-11 0-23 5-5 11-5t11 5l92 99q9 10 9 23t-9 22l-92 101q-5 5-11.5 5t-11.5-5-5-11.5 5-11.5l87-95q6-5 0-11zM37 249q-6 6 0 11l87 95q5 5 5 11.5t-5 11.5-11.5 5-11.5-5L9 277q-9-9-9-22t9-23l92-99q5-5 11-5t11 5q12 12 0 23z";
	const ltr = false;
	const accData = i18nDefaults.ICON_RESIZE_HORIZONTAL;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var resizeHorizontal = { pathData, accData };

	return resizeHorizontal;

});
