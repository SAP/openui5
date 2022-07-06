sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "multi-select";
	const pathData = "M179.5 358q25 0 25 25v102q0 26-25 26h-102q-26 0-26-26V383q0-25 26-25h102zm-26 51h-51v51h51v-51zm34-222q8-8 17.5-8t17.5 8 8 17.5-8 17.5l-102 102q-8 8-18 8t-18-8l-51-51q-8-8-8-17.5t8-17.5 18-8 18 8l33 33zm0-179q8-8 17.5-8t17.5 8 8 17.5-8 17.5l-102 103q-8 8-18 8t-18-8l-51-51q-8-8-8-18t8-18 18-8 18 8l33 33zm120 94q-26 0-26-25 0-26 26-26h153q11 0 18.5 7t7.5 19q0 11-7.5 18t-18.5 7h-153zm153 128q11 0 18.5 7t7.5 19q0 11-7.5 18t-18.5 7h-153q-26 0-26-25 0-26 26-26h153zm0 179q11 0 18.5 7t7.5 18q0 12-7.5 19t-18.5 7h-153q-26 0-26-26 0-25 26-25h153z";
	const ltr = true;
	const accData = i18nDefaults.ICON_MULTI_SELECT;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var multiSelect = "multi-select";

	exports.accData = accData;
	exports.default = multiSelect;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
