sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/key-user-settings', './v4/key-user-settings'], function (exports, Theme, keyUserSettings$1, keyUserSettings$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? keyUserSettings$1.pathData : keyUserSettings$2.pathData;
	var keyUserSettings = "key-user-settings";

	exports.accData = keyUserSettings$1.accData;
	exports.ltr = keyUserSettings$1.ltr;
	exports.default = keyUserSettings;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
