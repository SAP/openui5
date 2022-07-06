sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/screen-split-one', './v4/screen-split-one'], function (exports, Theme, screenSplitOne$1, screenSplitOne$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? screenSplitOne$1.pathData : screenSplitOne$2.pathData;
	var screenSplitOne = "screen-split-one";

	exports.accData = screenSplitOne$1.accData;
	exports.ltr = screenSplitOne$1.ltr;
	exports.default = screenSplitOne;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
