sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "down";
	const pathData = "M506.5 69c4 5 5 10 5 16 0 4-1 9-4 13l-226 368c-6 9-14 14-23 14-8 0-17-5-23-14L9.5 98c-4-6-7-13-7-20 0-3 0-5 1-8 4-8 14-14 26-14h453c11 0 19 5 24 13zm-251 329l176-286h-351z";
	const ltr = false;
	const accData = i18nDefaults.ICON_DOWN;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
