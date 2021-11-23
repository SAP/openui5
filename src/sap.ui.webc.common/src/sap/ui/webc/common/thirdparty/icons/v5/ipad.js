sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "ipad";
	const pathData = "M395.5 1c39 0 70 30 70 70v371c0 40-31 70-70 70h-279c-39 0-69-30-69-70V71c0-40 30-70 69-70h279zm-302 441h325V71h-325v371z";
	const ltr = false;
	const accData = i18nDefaults.ICON_IPAD;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
