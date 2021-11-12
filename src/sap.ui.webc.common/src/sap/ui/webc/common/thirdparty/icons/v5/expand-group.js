sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "expand-group";
	const pathData = "M257.5 403l102-103c6-6 14-9 22-9s15 3 22 9c6 7 9 14 9 22s-3 16-9 22l-124 124c-7 6-14 9-22 9s-16-3-22-9l-124-124c-6-6-9-14-9-22s3-15 9-22c6-6 14-9 22-9s15 3 22 9zm2-225l102-103c6-6 14-9 22-9 7 0 15 3 21 9 7 6 10 14 10 22s-3 15-10 22l-124 124c-6 6-13 9-21 9s-16-3-22-9l-124-124c-6-7-9-14-9-22s3-16 9-22 14-9 22-9 15 3 22 9z";
	const ltr = false;
	const accData = i18nDefaults.ICON_EXPAND_GROUP;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
