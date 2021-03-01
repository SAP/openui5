sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "up";
	const pathData = "M256 32l256 448H0zm0 64L64 448h384z";
	const ltr = false;
	const accData = i18nDefaults.ICON_UP;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var up = { pathData, accData };

	return up;

});
