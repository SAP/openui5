sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/nutrition-activity', './v4/nutrition-activity'], function (exports, Theme, nutritionActivity$1, nutritionActivity$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? nutritionActivity$1.pathData : nutritionActivity$2.pathData;
	var nutritionActivity = "nutrition-activity";

	exports.accData = nutritionActivity$1.accData;
	exports.ltr = nutritionActivity$1.ltr;
	exports.default = nutritionActivity;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
