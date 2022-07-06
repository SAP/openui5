sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/along-stacked-chart', './v4/along-stacked-chart'], function (exports, Theme, alongStackedChart$1, alongStackedChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? alongStackedChart$1.pathData : alongStackedChart$2.pathData;
	var alongStackedChart = "along-stacked-chart";

	exports.accData = alongStackedChart$1.accData;
	exports.ltr = alongStackedChart$1.ltr;
	exports.default = alongStackedChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
