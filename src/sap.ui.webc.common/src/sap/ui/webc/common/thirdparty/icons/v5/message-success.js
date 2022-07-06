sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "message-success";
	const pathData = "M256 0q53 0 99.5 20T437 75t55 81.5 20 99.5-20 99.5-55 81.5-81.5 55-99.5 20-99.5-20T75 437t-55-81.5T0 256t20-99.5T75 75t81.5-55T256 0zM128 256q-14 0-23 9t-9 23q0 12 9 23l64 64q11 9 23 9 13 0 23-9l192-192q9-11 9-23 0-13-9.5-22.5T384 128q-12 0-23 9L192 307l-41-42q-10-9-23-9z";
	const ltr = true;
	const accData = i18nDefaults.ICON_MESSAGE_SUCCESS;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var messageSuccess = "message-success";

	exports.accData = accData;
	exports.default = messageSuccess;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
