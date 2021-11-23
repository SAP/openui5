sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "message-error";
	const pathData = "M301 256l74-73c12-13 12-33 0-46-13-12-33-12-46 0l-73 74-73-74c-13-12-33-12-46 0-12 13-12 33 0 46l74 73-74 73c-12 13-12 33 0 46 13 12 33 12 46 0l73-74 73 74c13 12 33 12 46 0 12-13 12-33 0-46zm-45 256C115 512 0 397 0 256S115 0 256 0s256 115 256 256-115 256-256 256z";
	const ltr = false;
	const accData = i18nDefaults.ICON_MESSAGE_ERROR;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
