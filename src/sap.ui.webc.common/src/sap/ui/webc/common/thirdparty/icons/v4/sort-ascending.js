sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "sort-ascending";
	const pathData = "M353 128H161l17-32h158zm47 96H113l16-32h255zM82 288h351l15 32H65zm-48 96h446l15 32H17z";
	const ltr = false;
	const accData = i18nDefaults.ICON_SORT_ASCENDING;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV5 = { pathData, accData };

	return pathDataV5;

});
