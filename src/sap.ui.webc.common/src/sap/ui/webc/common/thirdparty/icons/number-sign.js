sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/number-sign', './v4/number-sign'], function (exports, Theme, numberSign$1, numberSign$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? numberSign$1.pathData : numberSign$2.pathData;
	var numberSign = "number-sign";

	exports.accData = numberSign$1.accData;
	exports.ltr = numberSign$1.ltr;
	exports.default = numberSign;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
