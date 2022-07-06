sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pharmacy', './v4/pharmacy'], function (exports, Theme, pharmacy$1, pharmacy$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pharmacy$1.pathData : pharmacy$2.pathData;
	var pharmacy = "pharmacy";

	exports.accData = pharmacy$1.accData;
	exports.ltr = pharmacy$1.ltr;
	exports.default = pharmacy;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
