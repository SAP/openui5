sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/italic-text', './v4/italic-text'], function (exports, Theme, italicText$1, italicText$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? italicText$1.pathData : italicText$2.pathData;
	var italicText = "italic-text";

	exports.accData = italicText$1.accData;
	exports.ltr = italicText$1.ltr;
	exports.default = italicText;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
