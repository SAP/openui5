sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/crossed-line-chart', './v4/crossed-line-chart'], function (exports, Theme, crossedLineChart$1, crossedLineChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? crossedLineChart$1.pathData : crossedLineChart$2.pathData;
	var crossedLineChart = "crossed-line-chart";

	exports.accData = crossedLineChart$1.accData;
	exports.ltr = crossedLineChart$1.ltr;
	exports.default = crossedLineChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
