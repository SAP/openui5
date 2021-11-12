sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "expand";
	const pathData = "M258.5 437l102-102c7-6 14-9 22-9s16 3 22 9 9 14 9 22c0 7-3 15-9 21l-124 124c-6 6-14 10-22 10s-15-4-22-10l-123-124c-7-6-10-14-10-21 0-8 3-16 10-22 6-6 13-9 21-9s16 3 22 9zm-1-361l-102 102c-6 7-14 10-22 10-7 0-15-3-21-10-6-6-10-13-10-21s4-16 10-22l124-124c6-6 14-9 21-9 8 0 16 3 22 9l124 124c6 6 9 14 9 22s-3 15-9 21c-6 7-14 10-22 10-7 0-15-3-21-10z";
	const ltr = false;
	const accData = i18nDefaults.ICON_EXPAND;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
