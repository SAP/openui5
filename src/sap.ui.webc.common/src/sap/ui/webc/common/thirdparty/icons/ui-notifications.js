sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/ui-notifications', './v4/ui-notifications'], function (exports, Theme, uiNotifications$1, uiNotifications$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? uiNotifications$1.pathData : uiNotifications$2.pathData;
	var uiNotifications = "ui-notifications";

	exports.accData = uiNotifications$1.accData;
	exports.ltr = uiNotifications$1.ltr;
	exports.default = uiNotifications;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
