sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "iphone-2";
	const pathData = "M435 64c44 0 77 33 77 77v214c-5 39-38 67-77 67H78c-44 0-77-34-77-77V141c0-44 33-77 77-77h357zm0 307c16 0 26-11 26-26v-15c0-11-5-18-15-23l-23-11c-8-5-16-12-16-23v-51c0-10 5-18 16-23l23-10c7-5 15-13 15-23v-25c0-16-10-26-26-26H78c-16 0-26 10-26 26v204c0 15 10 26 26 26h357z";
	const ltr = false;
	const accData = i18nDefaults.ICON_IPHONE;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
