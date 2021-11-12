sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "ipad-2";
	const pathData = "M465.5 30c26 0 46 21 46 47v325c0 25-20 46-46 46h-418c-26 0-47-21-47-46V77c0-26 21-47 47-47h418zm-395 47v325h372V77h-372z";
	const ltr = false;
	const accData = i18nDefaults.ICON_IPAD;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
