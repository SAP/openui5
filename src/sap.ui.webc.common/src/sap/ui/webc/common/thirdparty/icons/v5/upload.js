sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "upload";
	const pathData = "M471.5 459q12 0 19.5 7t7.5 20q0 12-7.5 19t-19.5 7h-430q-12 0-19.5-7t-7.5-19q0-13 7.5-20t19.5-7h430zm-304-304q-8 8-18 8t-20-8q-8-10-8-19 0-11 8-19l105-105 1-1q1 0 1-1h1q7-9 19-9 6 0 9.5 2t8.5 6l108 108q8 7 8 19 0 11-8 19t-19 8q-10 0-18-8l-62-62v258q0 12-7.5 19.5t-19.5 7.5-19.5-7.5-7.5-19.5V93z";
	const ltr = false;
	const accData = i18nDefaults.ICON_UPLOAD;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var upload = "upload";

	exports.accData = accData;
	exports.default = upload;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
