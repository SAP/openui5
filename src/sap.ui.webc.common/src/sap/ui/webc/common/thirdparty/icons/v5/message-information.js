sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "message-information";
	const pathData = "M288 378V250c0-18-14-32-32-32s-32 14-32 32v128c0 17 14 32 32 32s32-15 32-32zM256 0c141 0 256 115 256 256S397 512 256 512 0 397 0 256 115 0 256 0zm0 178c21 0 38-17 38-38s-17-39-38-39-38 18-38 39 17 38 38 38z";
	const ltr = true;
	const accData = i18nDefaults.ICON_MESSAGE_INFORMATION;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
