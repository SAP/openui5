sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/negative', './v4/negative'], function (exports, Theme, negative$1, negative$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? negative$1.pathData : negative$2.pathData;
	var negative = "negative";

	exports.accData = negative$1.accData;
	exports.ltr = negative$1.ltr;
	exports.default = negative;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
