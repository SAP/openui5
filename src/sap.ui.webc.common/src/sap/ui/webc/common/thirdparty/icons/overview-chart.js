sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/overview-chart', './v4/overview-chart'], function (exports, Theme, overviewChart$1, overviewChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? overviewChart$1.pathData : overviewChart$2.pathData;
	var overviewChart = "overview-chart";

	exports.accData = overviewChart$1.accData;
	exports.ltr = overviewChart$1.ltr;
	exports.default = overviewChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
