sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/activities', './v4/activities'], function (exports, Theme, activities$1, activities$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? activities$1.pathData : activities$2.pathData;
	var activities = "activities";

	exports.accData = activities$1.accData;
	exports.ltr = activities$1.ltr;
	exports.default = activities;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
