sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "message-warning";
	const pathData = "M502 373q9 19 11 37v6q0 31-23 47.5T440 480H74q-13 0-26-4.5T24.5 463t-17-20.5T1 415v-4q0-9 3.5-18t8.5-20L198 38q23-39 61-39 37 0 59 39zm-65 75q43 0 43-32 0-10-8-28L292 54q-6-12-15.5-17.5T258 31t-18 5.5T225 54L43 388q-7 13-7 28 0 32 42 32h359zM257 144q13 0 23.5 8t10.5 25l-9 84-2 37q-2 21-24 21-8 0-15.5-5t-7.5-16q-2-38-3.5-61.5t-3-36.5-2.5-18l-1-5q0-17 10.5-25t23.5-8zm0 206q14 0 23 9t9 23-9 23-23 9-23-9-9-23 9-23 23-9z";
	const ltr = false;
	const accData = i18nDefaults.ICON_MESSAGE_WARNING;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var messageWarning = "message-warning";

	exports.accData = accData;
	exports.default = messageWarning;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
