sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/increase-line-height', './v4/increase-line-height'], function (exports, Theme, increaseLineHeight$1, increaseLineHeight$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? increaseLineHeight$1.pathData : increaseLineHeight$2.pathData;
	var increaseLineHeight = "increase-line-height";

	exports.accData = increaseLineHeight$1.accData;
	exports.ltr = increaseLineHeight$1.ltr;
	exports.default = increaseLineHeight;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
