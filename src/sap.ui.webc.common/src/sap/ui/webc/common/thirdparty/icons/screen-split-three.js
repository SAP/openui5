sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/screen-split-three', './v4/screen-split-three'], function (exports, Theme, screenSplitThree$1, screenSplitThree$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? screenSplitThree$1.pathData : screenSplitThree$2.pathData;
	var screenSplitThree = "screen-split-three";

	exports.accData = screenSplitThree$1.accData;
	exports.ltr = screenSplitThree$1.ltr;
	exports.default = screenSplitThree;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
