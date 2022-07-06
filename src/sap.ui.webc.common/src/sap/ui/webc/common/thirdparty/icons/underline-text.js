sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/underline-text', './v4/underline-text'], function (exports, Theme, underlineText$1, underlineText$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? underlineText$1.pathData : underlineText$2.pathData;
	var underlineText = "underline-text";

	exports.accData = underlineText$1.accData;
	exports.ltr = underlineText$1.ltr;
	exports.default = underlineText;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
