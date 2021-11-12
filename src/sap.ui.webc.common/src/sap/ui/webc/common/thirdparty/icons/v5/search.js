sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "search";
	const pathData = "M488 435c5 5 8 12 8 19 0 6-3 13-8 18-5 6-12 8-19 8-6 0-13-2-18-8l-91-90c-37 29-83 45-131 45-117 0-213-96-213-213C16 96 112 0 229 0c118 0 214 96 214 214 0 48-16 93-46 130zM69 214c0 88 72 160 160 160s160-72 160-160S317 54 229 54 69 126 69 214z";
	const ltr = true;
	const accData = i18nDefaults.ICON_SEARCH;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
