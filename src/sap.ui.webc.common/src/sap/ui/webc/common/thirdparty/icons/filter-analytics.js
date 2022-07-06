sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/filter-analytics', './v4/filter-analytics'], function (exports, Theme, filterAnalytics$1, filterAnalytics$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? filterAnalytics$1.pathData : filterAnalytics$2.pathData;
	var filterAnalytics = "filter-analytics";

	exports.accData = filterAnalytics$1.accData;
	exports.ltr = filterAnalytics$1.ltr;
	exports.default = filterAnalytics;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
