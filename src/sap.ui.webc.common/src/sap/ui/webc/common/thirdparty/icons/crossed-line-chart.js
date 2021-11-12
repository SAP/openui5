sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/crossed-line-chart', './v4/crossed-line-chart'], function (Theme, crossedLineChart$2, crossedLineChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? crossedLineChart$1 : crossedLineChart$2;
	var crossedLineChart = { pathData };

	return crossedLineChart;

});
