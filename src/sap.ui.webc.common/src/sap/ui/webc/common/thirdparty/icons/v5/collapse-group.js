sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "collapse-group";
	const pathData = "M258.5 140l-102 103c-7 6-14 9-22 9s-16-3-22-9c-6-7-9-14-9-22s3-16 9-22l124-124c6-6 14-9 22-9s15 3 21 9l124 124c7 6 10 14 10 22s-3 15-10 22c-6 6-14 9-21 9-8 0-16-3-22-9zm-2 225l-102 103c-7 6-14 9-22 9s-16-3-22-9c-6-7-9-14-9-22s3-16 9-22l124-124c6-6 14-9 22-9s15 3 22 9l124 124c6 6 9 14 9 22s-3 15-9 22c-7 6-14 9-22 9s-16-3-22-9z";
	const ltr = false;
	const accData = i18nDefaults.ICON_COLLAPSE_GROUP;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
