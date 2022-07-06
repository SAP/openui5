sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/strikethrough', './v4/strikethrough'], function (exports, Theme, strikethrough$1, strikethrough$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? strikethrough$1.pathData : strikethrough$2.pathData;
	var strikethrough = "strikethrough";

	exports.accData = strikethrough$1.accData;
	exports.ltr = strikethrough$1.ltr;
	exports.default = strikethrough;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
