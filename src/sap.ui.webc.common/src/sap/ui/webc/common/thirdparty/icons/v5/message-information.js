sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "message-information";
	const pathData = "M288 250q0-14-9-23t-23-9-23 9-9 23v128q0 13 9 22.5t23 9.5 23-9.5 9-22.5V250zM256 0q53 0 99.5 20T437 75t55 81.5 20 99.5-20 99.5-55 81.5-81.5 55-99.5 20-99.5-20T75 437t-55-81.5T0 256t20-99.5T75 75t81.5-55T256 0zm0 178q16 0 27-11t11-27-11-27.5-27-11.5-27 11.5-11 27.5 11 27 27 11z";
	const ltr = true;
	const accData = i18nDefaults.ICON_MESSAGE_INFORMATION;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var messageInformation = "message-information";

	exports.accData = accData;
	exports.default = messageInformation;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
