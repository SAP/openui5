sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "show";
	const pathData = "M3 239c4-7 102-174 253-174s249 167 253 174 4 16 0 23-102 175-253 175S7 270 3 262c-4-7-4-16 0-23zm48 12c23 35 101 139 205 139s182-104 205-139c-23-36-101-140-205-140S74 215 51 251zm112 0c0-51 42-93 93-93s93 42 93 93-42 93-93 93-93-42-93-93zm46 0c0 26 21 46 47 46s47-20 47-46-21-47-47-47-47 21-47 47z";
	const ltr = false;
	const accData = i18nDefaults.ICON_SHOW;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
