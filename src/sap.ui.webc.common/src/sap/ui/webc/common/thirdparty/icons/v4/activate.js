sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "activate";
	const pathData = "M140 64l21-58 21 58h59l-47 39 20 64-53-40-55 40 21-64-47-39h60zm196 0h59l21-58 21 58h59l-47 39 20 64-53-40-54 40 21-64zM21 408l249-249q5-5 11-5t11 5l45 45q6 5 6 11t-6 12L89 475q-5 5-12 5-6 0-11-5l-45-45q-6-6-6-11 0-6 6-11zm315-120h59l21-58 21 58h59l-47 39 20 64-53-40-54 40 21-64zM55 419l22 23 181-181-22-23z";
	const ltr = false;
	const accData = i18nDefaults.ICON_ACTIVATE;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var activate = "activate";

	exports.accData = accData;
	exports.default = activate;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
