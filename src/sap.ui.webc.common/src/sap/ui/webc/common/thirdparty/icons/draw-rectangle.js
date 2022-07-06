sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/draw-rectangle', './v4/draw-rectangle'], function (exports, Theme, drawRectangle$1, drawRectangle$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? drawRectangle$1.pathData : drawRectangle$2.pathData;
	var drawRectangle = "draw-rectangle";

	exports.accData = drawRectangle$1.accData;
	exports.ltr = drawRectangle$1.ltr;
	exports.default = drawRectangle;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
