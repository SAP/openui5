sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "undo";
	const pathData = "M478.984 304q4 36-7.5 68t-33 56-52.5 38-66 14h-256q-13 0-22.5-9t-9.5-23q0-13 9.5-22.5t22.5-9.5h253q35 0 63-21t34-56q4-23-1.5-44t-19-36.5-32.5-25-41-9.5h-180l75 74q9 9 9 22.5t-9 22.5q-10 10-23 10t-23-10l-128-128q-9-9-9-22.5t9-22.5l129-128q10-10 23-10t22 10q10 9 10 22t-10 23l-74 73h172q31 0 60 11t51.5 30 37 45.5 17.5 57.5z";
	const ltr = false;
	const accData = i18nDefaults.ICON_UNDO;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var undo = { pathData, accData };

	return undo;

});
