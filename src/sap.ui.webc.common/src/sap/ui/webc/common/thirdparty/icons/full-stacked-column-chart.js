sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/full-stacked-column-chart', './v4/full-stacked-column-chart'], function (Theme, fullStackedColumnChart$2, fullStackedColumnChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? fullStackedColumnChart$1 : fullStackedColumnChart$2;
	var fullStackedColumnChart = { pathData };

	return fullStackedColumnChart;

});
