sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "filter";
	const pathData = "M448 32q20 0 26 12t6 20q0 9-6 18-12 12-23 26-11 12-23 27t-26 30q-32 36-73 82-9 9-9 23v114l-101 91q-4 5-11 5-6 0-11-4t-5-12V270q0-13-10-23l-72-82q-14-15-27-30t-23-26.5-16-19L38 82q-6-9-6-18 0-8 6-20t26-12h384zM306 225q40-45 71-80 13-15 25.5-29.5t22.5-26T441.5 71l6.5-7H64l6 7.5L86 90l22.5 25.5L135 145q31 35 71 80 18 20 18 45v158l64-58V270q0-27 18-45z";
	const ltr = false;
	const accData = i18nDefaults.ICON_FILTER;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var filter = "filter";

	exports.accData = accData;
	exports.default = filter;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
