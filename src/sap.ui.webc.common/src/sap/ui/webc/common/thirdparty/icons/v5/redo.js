sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "redo";
	const pathData = "M330 342c-13-12-13-32 0-44l73-74H160c-54 0-96 42-96 96s42 96 96 96h192c19 0 32 13 32 32s-13 32-32 32H160C71 480 1 410 1 320c0-89 70-160 159-160h243l-73-73c-13-13-13-32 0-45 12-13 31-13 44 0l125 125c6 6 13 13 13 25 0 13-4 19-13 26L374 342c-13 13-32 13-44 0z";
	const ltr = false;
	const accData = i18nDefaults.ICON_REDO;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
