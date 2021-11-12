sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "download";
	const pathData = "M472 459c16 0 27 13 27 27 0 13-11 27-27 27H41c-17 0-27-14-27-27 0-14 10-27 27-27h431zm-235-89L132 262c-11-10-11-27 0-37 11-11 27-11 38 0l62 62V28c0-16 11-27 27-27s27 11 27 27v259l62-62c11-11 27-11 38 0 10 10 10 27 0 37L278 370c-3 3-8 5-11 8-5 3-13 3-19 0-5-3-8-5-11-8z";
	const ltr = false;
	const accData = i18nDefaults.ICON_DOWNLOAD;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
