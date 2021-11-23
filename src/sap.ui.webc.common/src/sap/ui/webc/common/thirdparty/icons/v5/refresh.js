sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "refresh";
	const pathData = "M309.5 179c0-15 11-25 23-25h100c-36-62-100-103-175-103-114 0-206 92-206 205 0 112 92 204 205 204 97 0 179-66 199-158 3-14 15-21 26-21h5c13 2 20 14 21 25 0 1 0 2-1 3v3c-28 115-128 199-249 199-142 0-257-115-257-255 0-141 115-256 256-256 84 0 158 41 204 102V26c0-16 10-26 26-26 15 0 25 10 25 26v153c0 15-10 26-25 26h-151c-15 0-26-11-26-26z";
	const ltr = false;
	const accData = i18nDefaults.ICON_REFRESH;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
