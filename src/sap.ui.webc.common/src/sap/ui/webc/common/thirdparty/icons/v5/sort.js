sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "sort";
	const pathData = "M54.625 361l42 42V33c0-20 13-32 32-32s32 12 32 32v370l41-42c13-12 32-12 45 0 13 13 13 32 0 45l-96 96c-13 13-32 13-45 0l-95-96c-13-13-13-32 0-45 12-12 32-12 44 0zm297-252l-41 42c-13 13-32 13-45 0s-13-32 0-45l96-96c13-12 32-12 45 0l95 96c13 13 13 32 0 45-12 13-31 13-44 0l-42-42v371c0 19-13 32-32 32s-32-13-32-32V109z";
	const ltr = false;
	const accData = i18nDefaults.ICON_SORT;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
