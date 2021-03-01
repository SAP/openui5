sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "down";
	const pathData = "M0 32h512L256 480zm64 32l192 352L448 64H64z";
	const ltr = false;
	const accData = i18nDefaults.ICON_DOWN;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var down = { pathData, accData };

	return down;

});
