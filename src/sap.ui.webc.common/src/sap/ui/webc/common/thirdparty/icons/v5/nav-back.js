sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "nav-back";
	const pathData = "M340.5 358q9 9 9 22 0 11-9 22-9 9-22 9-11 0-22-9l-124-124q-9-11-9-22 0-13 9-22l124-124q11-9 22-9 13 0 22 9t9 22q0 11-9 22l-103 102z";
	const ltr = false;
	const accData = i18nDefaults.ICON_NAV_BACK;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
