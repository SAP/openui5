sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/headset', './v4/headset'], function (exports, Theme, headset$1, headset$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? headset$1.pathData : headset$2.pathData;
	var headset = "headset";

	exports.accData = headset$1.accData;
	exports.ltr = headset$1.ltr;
	exports.default = headset;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
