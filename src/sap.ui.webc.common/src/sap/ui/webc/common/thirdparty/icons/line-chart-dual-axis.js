sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/line-chart-dual-axis', './v4/line-chart-dual-axis'], function (exports, Theme, lineChartDualAxis$1, lineChartDualAxis$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? lineChartDualAxis$1.pathData : lineChartDualAxis$2.pathData;
	var lineChartDualAxis = "line-chart-dual-axis";

	exports.accData = lineChartDualAxis$1.accData;
	exports.ltr = lineChartDualAxis$1.ltr;
	exports.default = lineChartDualAxis;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
