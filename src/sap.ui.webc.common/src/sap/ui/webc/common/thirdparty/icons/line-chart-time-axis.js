sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/line-chart-time-axis', './v4/line-chart-time-axis'], function (exports, Theme, lineChartTimeAxis$1, lineChartTimeAxis$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? lineChartTimeAxis$1.pathData : lineChartTimeAxis$2.pathData;
	var lineChartTimeAxis = "line-chart-time-axis";

	exports.accData = lineChartTimeAxis$1.accData;
	exports.ltr = lineChartTimeAxis$1.ltr;
	exports.default = lineChartTimeAxis;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
