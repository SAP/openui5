sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "laptop";
	const pathData = "M494 405c13 0 21 8 21 21s-8 21-21 21H24c-12 0-21-8-21-21s9-21 21-21h26c0-1 0-2-1-3v-1c-2-6-3-11-3-18V170c0-36 27-64 64-64h298c37 0 64 28 64 64v213c0 8-1 14-4 22h26zM88 170v213h342V170c0-13-9-21-22-21H110c-13 0-22 8-22 21z";
	const ltr = false;
	const accData = i18nDefaults.ICON_LAPTOP;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
