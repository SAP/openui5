sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (exports, Icons) { 'use strict';

	const name = "ui-notifications";
	const pathData = "M0 128q0-26 19-45t45-19h448v32H64q-14 0-23 9t-9 23v256q0 14 9 23t23 9h384v32H64q-26 0-45-19T0 384V128zm112 64h256q16 0 16 16t-16 16H112q-16 0-16-16t16-16zm48 112q0-16 16-16h336v32H176q-16 0-16-16z";
	const ltr = false;
	const accData = null;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var uiNotifications = "ui-notifications";

	exports.accData = accData;
	exports.default = uiNotifications;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
