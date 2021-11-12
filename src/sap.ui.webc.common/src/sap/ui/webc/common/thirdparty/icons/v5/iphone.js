sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "iphone";
	const pathData = "M360.908 1c43 0 77 33 74 76v358c0 43-33 77-77 77h-204c-43 0-77-34-77-77V77c0-43 34-76 77-76h207zm26 434V77c0-15-11-25-26-25h-20c-11 0-18 7-23 15l-11 23c-5 10-12 15-23 15h-51c-10 0-18-7-23-15l-10-23c-5-10-13-15-23-15h-20c-16 0-26 10-26 25v358c0 15 10 26 26 26h204c15 0 26-11 26-26z";
	const ltr = false;
	const accData = i18nDefaults.ICON_IPHONE;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
