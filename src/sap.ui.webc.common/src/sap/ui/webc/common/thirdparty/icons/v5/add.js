sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "add";
	const pathData = "M444 220c22 0 36 15 36 37s-14 37-36 37H294v149c0 22-15 37-37 37s-36-15-36-37V294H69c-22 0-37-15-37-37s15-37 37-37h152V73c0-22 14-37 36-37s37 15 37 37v147h150z";
	const ltr = false;
	const accData = i18nDefaults.ICON_ADD;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
