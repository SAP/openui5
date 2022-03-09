sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/heatmap-chart', './v4/heatmap-chart'], function (Theme, heatmapChart$2, heatmapChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? heatmapChart$1 : heatmapChart$2;
	var heatmapChart = { pathData };

	return heatmapChart;

});
