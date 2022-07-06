sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/e-learning', './v4/e-learning'], function (exports, Theme, eLearning$1, eLearning$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? eLearning$1.pathData : eLearning$2.pathData;
	var eLearning = "e-learning";

	exports.accData = eLearning$1.accData;
	exports.ltr = eLearning$1.ltr;
	exports.default = eLearning;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
