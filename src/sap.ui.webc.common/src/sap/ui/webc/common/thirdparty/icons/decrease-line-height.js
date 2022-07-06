sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/decrease-line-height', './v4/decrease-line-height'], function (exports, Theme, decreaseLineHeight$1, decreaseLineHeight$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? decreaseLineHeight$1.pathData : decreaseLineHeight$2.pathData;
	var decreaseLineHeight = "decrease-line-height";

	exports.accData = decreaseLineHeight$1.accData;
	exports.ltr = decreaseLineHeight$1.ltr;
	exports.default = decreaseLineHeight;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
