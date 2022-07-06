sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/horizontal-stacked-chart', './v4/horizontal-stacked-chart'], function (exports, Theme, horizontalStackedChart$1, horizontalStackedChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? horizontalStackedChart$1.pathData : horizontalStackedChart$2.pathData;
	var horizontalStackedChart = "horizontal-stacked-chart";

	exports.accData = horizontalStackedChart$1.accData;
	exports.ltr = horizontalStackedChart$1.ltr;
	exports.default = horizontalStackedChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
