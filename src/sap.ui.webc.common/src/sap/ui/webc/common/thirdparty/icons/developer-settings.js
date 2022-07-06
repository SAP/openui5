sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/developer-settings', './v4/developer-settings'], function (exports, Theme, developerSettings$1, developerSettings$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? developerSettings$1.pathData : developerSettings$2.pathData;
	var developerSettings = "developer-settings";

	exports.accData = developerSettings$1.accData;
	exports.ltr = developerSettings$1.ltr;
	exports.default = developerSettings;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
