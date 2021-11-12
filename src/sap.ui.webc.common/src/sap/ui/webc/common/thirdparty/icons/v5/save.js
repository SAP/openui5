sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "save";
	const pathData = "M503.5 150c5 6 8 12 8 20v256c0 48-37 85-85 85h-341c-48 0-85-37-85-85V85c0-48 37-85 85-85h256c8 0 14 3 20 9zm-162 304V341h-170v113h170zm113-28V182l-124-125h-159v85h142c17 0 28 11 28 28s-11 29-28 29h-171c-17 0-28-12-28-29V57h-29c-17 0-28 11-28 28v341c0 17 11 28 28 28h29V312c0-17 11-28 28-28h227c17 0 29 11 29 28v142h28c17 0 28-11 28-28z";
	const ltr = false;
	const accData = i18nDefaults.ICON_SAVE;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
