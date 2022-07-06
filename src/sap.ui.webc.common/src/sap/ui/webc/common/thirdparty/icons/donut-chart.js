sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/donut-chart', './v4/donut-chart'], function (exports, Theme, donutChart$1, donutChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? donutChart$1.pathData : donutChart$2.pathData;
	var donutChart = "donut-chart";

	exports.accData = donutChart$1.accData;
	exports.ltr = donutChart$1.ltr;
	exports.default = donutChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
