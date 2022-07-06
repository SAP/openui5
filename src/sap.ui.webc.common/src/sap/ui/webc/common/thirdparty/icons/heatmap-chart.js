sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/heatmap-chart', './v4/heatmap-chart'], function (exports, Theme, heatmapChart$1, heatmapChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? heatmapChart$1.pathData : heatmapChart$2.pathData;
	var heatmapChart = "heatmap-chart";

	exports.accData = heatmapChart$1.accData;
	exports.ltr = heatmapChart$1.ltr;
	exports.default = heatmapChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
