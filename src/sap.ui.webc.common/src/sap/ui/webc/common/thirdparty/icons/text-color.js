sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/text-color', './v4/text-color'], function (exports, Theme, textColor$1, textColor$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? textColor$1.pathData : textColor$2.pathData;
	var textColor = "text-color";

	exports.accData = textColor$1.accData;
	exports.ltr = textColor$1.ltr;
	exports.default = textColor;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
