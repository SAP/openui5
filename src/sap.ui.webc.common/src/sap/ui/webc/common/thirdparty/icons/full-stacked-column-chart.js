sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/full-stacked-column-chart', './v4/full-stacked-column-chart'], function (exports, Theme, fullStackedColumnChart$1, fullStackedColumnChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? fullStackedColumnChart$1.pathData : fullStackedColumnChart$2.pathData;
	var fullStackedColumnChart = "full-stacked-column-chart";

	exports.accData = fullStackedColumnChart$1.accData;
	exports.ltr = fullStackedColumnChart$1.ltr;
	exports.default = fullStackedColumnChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
