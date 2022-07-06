sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/text-align-right', './v4/text-align-right'], function (exports, Theme, textAlignRight$1, textAlignRight$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? textAlignRight$1.pathData : textAlignRight$2.pathData;
	var textAlignRight = "text-align-right";

	exports.accData = textAlignRight$1.accData;
	exports.ltr = textAlignRight$1.ltr;
	exports.default = textAlignRight;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
