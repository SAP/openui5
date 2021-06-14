sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "laptop";
	const pathData = "M96 320q-14 0-23-9.5T64 288V64q0-14 9-23t23-9h320q13 0 22.5 9t9.5 23v224q0 13-9.5 22.5T416 320H96zm0-32h320V64H96v224zm416 155q0 15-11 26t-26 11H37q-15 0-26-11T0 443l73-91h366zm-192 5l-32-32h-64l-32 32h128z";
	const ltr = false;
	const accData = i18nDefaults.ICON_LAPTOP;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var laptop = { pathData, accData };

	return laptop;

});
