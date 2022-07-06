sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/numbered-text', './v4/numbered-text'], function (exports, Theme, numberedText$1, numberedText$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? numberedText$1.pathData : numberedText$2.pathData;
	var numberedText = "numbered-text";

	exports.accData = numberedText$1.accData;
	exports.ltr = numberedText$1.ltr;
	exports.default = numberedText;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
