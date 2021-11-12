sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "up";
	const pathData = "M430.25 423l-176-286-175 286h351zm77 43c-6 8-14 14-26 14h-453c-12 0-22-7-26-14-4-10 0-20 6-29l227-369c4-8 14-14 22-14 9 0 17 6 23 14l227 369c6 9 6 20 0 29z";
	const ltr = false;
	const accData = i18nDefaults.ICON_UP;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
