sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/horizontal-bar-chart', './v4/horizontal-bar-chart'], function (Theme, horizontalBarChart$2, horizontalBarChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? horizontalBarChart$1 : horizontalBarChart$2;
	var horizontalBarChart = { pathData };

	return horizontalBarChart;

});
