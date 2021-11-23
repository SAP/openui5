sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "flag";
	const pathData = "M471 61c8 3 14 14 14 23v284c0 11-9 19-17 25l-20 9c-68 34-148 31-213-6l-17-9c-42-22-94-22-133 0v97c0 17-12 28-29 28s-28-11-28-28V30C28 13 39 1 56 1s29 12 29 29v8c54-20 110-14 159 14l17 12c51 28 110 31 162 6l19-9c9-6 20-6 29 0zm-46 292V132c-62 23-133 17-190-17l-17-9c-42-25-94-25-133-2v221c51-17 110-14 159 14l17 12c48 28 110 28 164 2z";
	const ltr = true;
	const accData = i18nDefaults.ICON_FLAG;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
