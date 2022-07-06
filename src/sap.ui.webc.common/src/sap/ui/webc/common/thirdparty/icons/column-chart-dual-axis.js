sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/column-chart-dual-axis', './v4/column-chart-dual-axis'], function (exports, Theme, columnChartDualAxis$1, columnChartDualAxis$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? columnChartDualAxis$1.pathData : columnChartDualAxis$2.pathData;
	var columnChartDualAxis = "column-chart-dual-axis";

	exports.accData = columnChartDualAxis$1.accData;
	exports.ltr = columnChartDualAxis$1.ltr;
	exports.default = columnChartDualAxis;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
