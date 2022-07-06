sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/text-formatting', './v4/text-formatting'], function (exports, Theme, textFormatting$1, textFormatting$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? textFormatting$1.pathData : textFormatting$2.pathData;
	var textFormatting = "text-formatting";

	exports.accData = textFormatting$1.accData;
	exports.ltr = textFormatting$1.ltr;
	exports.default = textFormatting;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
