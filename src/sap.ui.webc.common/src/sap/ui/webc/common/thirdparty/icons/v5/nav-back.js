sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "nav-back";
	const pathData = "M237.5 256l103 102c6 6 9 14 9 22s-3 15-9 22c-6 6-14 9-22 9s-15-3-22-9l-124-124c-6-7-9-14-9-22s3-16 9-22l124-124c7-6 14-9 22-9s16 3 22 9 9 14 9 22-3 15-9 22z";
	const ltr = false;
	const accData = i18nDefaults.ICON_NAV_BACK;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
