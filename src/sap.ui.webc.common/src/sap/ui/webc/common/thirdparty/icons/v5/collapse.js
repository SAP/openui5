sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "collapse";
	const pathData = "M258.5 111l102-102c6-6 14-9 22-9 7 0 15 3 21 9 7 6 10 14 10 22 0 7-3 15-10 21l-124 124c-6 6-14 10-21 10-8 0-16-4-22-10l-124-124c-6-6-9-14-9-21 0-8 3-16 9-22s14-9 22-9 15 3 21 9zm0 289l-103 102c-6 7-13 10-21 10s-16-3-22-10c-6-6-9-14-9-21 0-8 3-16 9-22l124-124c6-6 14-9 22-9 7 0 15 3 21 9l124 124c7 6 10 14 10 22 0 7-3 15-10 21-6 7-14 10-21 10-8 0-16-3-22-10z";
	const ltr = false;
	const accData = i18nDefaults.ICON_COLLAPSE;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
