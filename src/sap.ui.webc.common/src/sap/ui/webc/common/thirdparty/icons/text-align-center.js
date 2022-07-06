sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/text-align-center', './v4/text-align-center'], function (exports, Theme, textAlignCenter$1, textAlignCenter$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? textAlignCenter$1.pathData : textAlignCenter$2.pathData;
	var textAlignCenter = "text-align-center";

	exports.accData = textAlignCenter$1.accData;
	exports.ltr = textAlignCenter$1.ltr;
	exports.default = textAlignCenter;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
