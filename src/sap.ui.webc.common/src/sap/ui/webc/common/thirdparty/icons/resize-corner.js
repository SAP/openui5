sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/resize-corner', './v4/resize-corner'], function (exports, Theme, resizeCorner$1, resizeCorner$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? resizeCorner$1.pathData : resizeCorner$2.pathData;
	var resizeCorner = "resize-corner";

	exports.accData = resizeCorner$1.accData;
	exports.ltr = resizeCorner$1.ltr;
	exports.default = resizeCorner;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
