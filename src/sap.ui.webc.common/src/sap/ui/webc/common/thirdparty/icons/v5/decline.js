sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "decline";
	const pathData = "M452.5 417c8 7 12 17 12 26s-4 19-12 26c-7 8-17 12-26 12s-19-4-26-12l-144-143-145 143c-8 8-17 12-26 12-10 0-19-4-27-12-7-7-11-17-11-26s4-19 11-26l145-143-145-146c-7-8-11-17-11-26 0-10 4-19 11-27 8-7 17-11 27-11 9 0 18 4 26 11l145 146 144-146c7-7 17-11 26-11 10 0 19 4 26 11 8 8 12 17 12 27 0 9-4 18-12 26l-144 146z";
	const ltr = false;
	const accData = i18nDefaults.ICON_DECLINE;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
