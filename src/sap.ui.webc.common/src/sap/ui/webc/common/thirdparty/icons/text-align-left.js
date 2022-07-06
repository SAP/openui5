sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/text-align-left', './v4/text-align-left'], function (exports, Theme, textAlignLeft$1, textAlignLeft$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? textAlignLeft$1.pathData : textAlignLeft$2.pathData;
	var textAlignLeft = "text-align-left";

	exports.accData = textAlignLeft$1.accData;
	exports.ltr = textAlignLeft$1.ltr;
	exports.default = textAlignLeft;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
