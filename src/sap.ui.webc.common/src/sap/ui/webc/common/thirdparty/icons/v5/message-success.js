sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "message-success";
	const pathData = "M256 0c141 0 256 115 256 256S397 512 256 512 0 397 0 256 115 0 256 0zM128 256c-18 0-32 14-32 32 0 8 3 16 9 23l64 64c7 6 15 9 23 9s16-3 23-9l192-192c6-7 9-15 9-23 0-17-15-32-32-32-8 0-16 3-23 9L192 307l-41-42c-7-6-15-9-23-9z";
	const ltr = true;
	const accData = i18nDefaults.ICON_MESSAGE_SUCCESS;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
