sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/choropleth-chart', './v4/choropleth-chart'], function (exports, Theme, choroplethChart$1, choroplethChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? choroplethChart$1.pathData : choroplethChart$2.pathData;
	var choroplethChart = "choropleth-chart";

	exports.accData = choroplethChart$1.accData;
	exports.ltr = choroplethChart$1.ltr;
	exports.default = choroplethChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
