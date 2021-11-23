sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "sort-ascending";
	const pathData = "M483.5 256c17 0 28 11 28 28s-11 29-28 29h-256c-17 0-28-12-28-29s11-28 28-28h256zm-256-57c-17 0-28-11-28-28s11-29 28-29h171c17 0 28 12 28 29s-11 28-28 28h-171zm0-113c-17 0-28-12-28-29s11-28 28-28h85c17 0 29 11 29 28s-12 29-29 29h-85zm-179 292l37 37V57c0-17 12-28 29-28s28 11 28 28v358l37-37c11-12 28-12 40 0 11 11 11 28 0 40l-85 85c-12 11-29 11-40 0l-85-85c-12-12-12-29 0-40 11-12 28-12 39 0z";
	const ltr = false;
	const accData = i18nDefaults.ICON_SORT_ASCENDING;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
