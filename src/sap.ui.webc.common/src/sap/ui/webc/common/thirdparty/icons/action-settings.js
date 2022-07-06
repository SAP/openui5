sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/action-settings', './v4/action-settings'], function (exports, Theme, actionSettings$1, actionSettings$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? actionSettings$1.pathData : actionSettings$2.pathData;
	var actionSettings = "action-settings";

	exports.accData = actionSettings$1.accData;
	exports.ltr = actionSettings$1.ltr;
	exports.default = actionSettings;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
