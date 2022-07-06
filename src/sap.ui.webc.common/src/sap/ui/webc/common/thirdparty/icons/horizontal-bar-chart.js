sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/horizontal-bar-chart', './v4/horizontal-bar-chart'], function (exports, Theme, horizontalBarChart$1, horizontalBarChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? horizontalBarChart$1.pathData : horizontalBarChart$2.pathData;
	var horizontalBarChart = "horizontal-bar-chart";

	exports.accData = horizontalBarChart$1.accData;
	exports.ltr = horizontalBarChart$1.ltr;
	exports.default = horizontalBarChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
