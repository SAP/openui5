sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/text-align-justified', './v4/text-align-justified'], function (exports, Theme, textAlignJustified$1, textAlignJustified$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? textAlignJustified$1.pathData : textAlignJustified$2.pathData;
	var textAlignJustified = "text-align-justified";

	exports.accData = textAlignJustified$1.accData;
	exports.ltr = textAlignJustified$1.ltr;
	exports.default = textAlignJustified;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
