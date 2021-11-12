sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "response";
	const pathData = "M125 148h95c40 0 78 7 113 22 35 16 66 36 93 63 26 27 47 57 62 93 16 35 23 73 23 113v36c0 10-3 19-10 26s-16 11-26 11-19-4-26-11-11-16-11-26v-36c0-30-5-59-17-85-11-27-27-50-46-70-20-20-43-35-70-46-26-12-55-18-85-18h-95l85 84c6 6 10 15 10 25s-4 19-10 26c-8 7-17 11-27 11-9 0-18-4-26-11L12 209c-7-7-11-15-11-25s4-19 11-26L158 12c8-7 17-11 27-11 9 0 18 4 25 11s11 15 11 25-4 19-11 26z";
	const ltr = false;
	const accData = i18nDefaults.ICON_RESPONSE;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
