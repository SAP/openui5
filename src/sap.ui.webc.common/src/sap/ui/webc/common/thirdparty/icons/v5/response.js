sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "response";
	const pathData = "M40 160L168 32q7-7 18-7t18 7 7 18-7 18l-84 85h78q59 0 110 22.5t89.5 60.5 60.5 89.5T480 435v51q0 11-7 18.5t-18 7.5-18.5-7.5T429 486v-51q0-48-18-90t-49.5-73.5T288 222t-90-18h-78l97 97q7 7 7 18t-7 18q-8 8-18 8t-18-8L40 196q-8-8-8-18t8-18z";
	const ltr = false;
	const accData = i18nDefaults.ICON_RESPONSE;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var response = "response";

	exports.accData = accData;
	exports.default = response;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
