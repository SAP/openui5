sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/full-stacked-chart', './v4/full-stacked-chart'], function (exports, Theme, fullStackedChart$1, fullStackedChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? fullStackedChart$1.pathData : fullStackedChart$2.pathData;
	var fullStackedChart = "full-stacked-chart";

	exports.accData = fullStackedChart$1.accData;
	exports.ltr = fullStackedChart$1.ltr;
	exports.default = fullStackedChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
