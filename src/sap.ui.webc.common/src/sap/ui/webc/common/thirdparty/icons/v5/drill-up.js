sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "drill-up";
	const pathData = "M150.125 183c-12 13-32 13-44 0-13-12-13-32 0-44l127-128c13-13 32-13 45 0l128 128c13 12 13 32 0 44-13 13-32 13-45 0l-105-105zm128-12l128 127c13 13 13 32 0 45s-32 13-45 0l-105-105-106 105c-12 13-32 13-44 0-13-13-13-32 0-45l127-127c13-13 32-13 45 0zm0 159l128 128c13 13 13 32 0 45s-32 13-45 0l-105-106-106 106c-12 13-32 13-44 0-13-13-13-32 0-45l127-128c13-12 32-12 45 0z";
	const ltr = false;
	const accData = i18nDefaults.ICON_DRILL_UP;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
