sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/switch-views', './v4/switch-views'], function (exports, Theme, switchViews$1, switchViews$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? switchViews$1.pathData : switchViews$2.pathData;
	var switchViews = "switch-views";

	exports.accData = switchViews$1.accData;
	exports.ltr = switchViews$1.ltr;
	exports.default = switchViews;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
