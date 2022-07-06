sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/color-fill', './v4/color-fill'], function (exports, Theme, colorFill$1, colorFill$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? colorFill$1.pathData : colorFill$2.pathData;
	var colorFill = "color-fill";

	exports.accData = colorFill$1.accData;
	exports.ltr = colorFill$1.ltr;
	exports.default = colorFill;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
