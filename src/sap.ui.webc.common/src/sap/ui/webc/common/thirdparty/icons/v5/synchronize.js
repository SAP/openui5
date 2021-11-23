sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "synchronize";
	const pathData = "M428 71l19 16 1-23c0-18 14-32 32-32s31 14 32 32v96c0 18-14 32-32 32h-97c-18 0-32-13-32-31s14-32 32-32h24l-21-17c-35-28-79-48-127-48-77 0-144 45-173 109-6 16-25 22-41 16-23-6-29-26-19-42C67 61 153 1 256 1c63 0 124 28 172 70zM84 441l-19-16-1 23c0 18-14 32-32 32S1 466 1 448v-96c-1-18 13-32 31-32h97c18 0 32 13 32 31s-14 32-32 32l-24 1 21 16c35 28 79 48 127 48 77 0 144-45 173-109 6-16 25-22 41-16 23 6 29 26 19 42-41 86-127 146-229 146-64 0-125-28-173-70z";
	const ltr = false;
	const accData = i18nDefaults.ICON_SYNCHRONIZE;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
