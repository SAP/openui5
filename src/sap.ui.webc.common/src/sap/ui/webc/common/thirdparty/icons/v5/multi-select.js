sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "multi-select";
	const pathData = "M179.5 358c15 0 25 10 25 25v102c0 16-10 26-25 26h-102c-16 0-26-10-26-26V383c0-15 10-25 26-25h102zm-26 102v-51h-51v51h51zm34-273c10-11 25-11 35 0 11 10 11 25 0 35l-102 102c-10 11-25 11-36 0l-51-51c-10-10-10-25 0-35 11-11 26-11 36 0l33 33zm0-179c10-11 25-11 35 0 11 10 11 25 0 35l-102 103c-10 10-25 10-36 0l-51-51c-10-11-10-26 0-36 11-10 26-10 36 0l33 33zm120 94c-16 0-26-10-26-25 0-16 10-26 26-26h153c15 0 26 10 26 26 0 15-11 25-26 25h-153zm153 128c15 0 26 10 26 26 0 15-11 25-26 25h-153c-16 0-26-10-26-25 0-16 10-26 26-26h153zm0 179c15 0 26 10 26 25 0 16-11 26-26 26h-153c-16 0-26-10-26-26 0-15 10-25 26-25h153z";
	const ltr = true;
	const accData = i18nDefaults.ICON_MULTI_SELECT;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
