sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/line-chart-time-axis', './v4/line-chart-time-axis'], function (Theme, lineChartTimeAxis$2, lineChartTimeAxis$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? lineChartTimeAxis$1 : lineChartTimeAxis$2;
	var lineChartTimeAxis = { pathData };

	return lineChartTimeAxis;

});
