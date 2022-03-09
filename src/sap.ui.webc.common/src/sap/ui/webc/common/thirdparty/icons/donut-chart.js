sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/donut-chart', './v4/donut-chart'], function (Theme, donutChart$2, donutChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? donutChart$1 : donutChart$2;
	var donutChart = { pathData };

	return donutChart;

});
