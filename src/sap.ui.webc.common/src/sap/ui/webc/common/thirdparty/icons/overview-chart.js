sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/overview-chart', './v4/overview-chart'], function (Theme, overviewChart$2, overviewChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? overviewChart$1 : overviewChart$2;
	var overviewChart = { pathData };

	return overviewChart;

});
