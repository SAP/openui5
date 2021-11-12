sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "message-warning";
	const pathData = "M312.125 34l192 353c23 42-8 94-56 94h-384c-48 0-79-52-56-94l192-353c24-45 88-45 112 0zm-88 119v128c0 18 14 33 32 33s32-15 32-33V153c0-17-14-32-32-32s-32 15-32 32zm32 277c21 0 38-17 38-39 0-21-17-38-38-38s-38 17-38 38c0 22 17 39 38 39z";
	const ltr = false;
	const accData = i18nDefaults.ICON_MESSAGE_WARNING;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
