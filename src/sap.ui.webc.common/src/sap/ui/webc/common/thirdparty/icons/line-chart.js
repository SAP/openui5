sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/line-chart', './v4/line-chart'], function (exports, Theme, lineChart$1, lineChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? lineChart$1.pathData : lineChart$2.pathData;
	var lineChart = "line-chart";

	exports.accData = lineChart$1.accData;
	exports.ltr = lineChart$1.ltr;
	exports.default = lineChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
