sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/screen-split-two', './v4/screen-split-two'], function (exports, Theme, screenSplitTwo$1, screenSplitTwo$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? screenSplitTwo$1.pathData : screenSplitTwo$2.pathData;
	var screenSplitTwo = "screen-split-two";

	exports.accData = screenSplitTwo$1.accData;
	exports.ltr = screenSplitTwo$1.ltr;
	exports.default = screenSplitTwo;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
