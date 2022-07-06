sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/user-settings', './v4/user-settings'], function (exports, Theme, userSettings$1, userSettings$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? userSettings$1.pathData : userSettings$2.pathData;
	var userSettings = "user-settings";

	exports.accData = userSettings$1.accData;
	exports.ltr = userSettings$1.ltr;
	exports.default = userSettings;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
