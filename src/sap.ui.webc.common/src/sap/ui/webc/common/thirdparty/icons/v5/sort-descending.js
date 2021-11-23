sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "sort-descending";
	const pathData = "M483 28c17 0 29 11 29 29 0 17-12 28-29 28H228c-17 0-28-11-28-28 0-18 11-29 28-29h255zm-85 114c17 0 29 11 29 28s-12 28-29 28H228c-17 0-28-11-28-28s11-28 28-28h170zm-85 113c17 0 28 12 28 29s-11 28-28 28h-85c-17 0-28-11-28-28s11-29 28-29h85zM49 377l37 37V57c0-18 11-29 28-29s29 11 29 29v357l37-37c11-11 28-11 39 0 12 12 12 29 0 40l-85 85c-11 12-28 12-40 0L9 417c-11-11-11-28 0-40 12-11 29-11 40 0z";
	const ltr = false;
	const accData = i18nDefaults.ICON_SORT_DESCENDING;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
