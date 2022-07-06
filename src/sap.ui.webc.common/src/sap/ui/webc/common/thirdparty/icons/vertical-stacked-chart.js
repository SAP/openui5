sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vertical-stacked-chart', './v4/vertical-stacked-chart'], function (exports, Theme, verticalStackedChart$1, verticalStackedChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? verticalStackedChart$1.pathData : verticalStackedChart$2.pathData;
	var verticalStackedChart = "vertical-stacked-chart";

	exports.accData = verticalStackedChart$1.accData;
	exports.ltr = verticalStackedChart$1.ltr;
	exports.default = verticalStackedChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
