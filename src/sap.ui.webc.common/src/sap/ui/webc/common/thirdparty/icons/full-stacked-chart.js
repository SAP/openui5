sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/full-stacked-chart', './v4/full-stacked-chart'], function (Theme, fullStackedChart$2, fullStackedChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? fullStackedChart$1 : fullStackedChart$2;
	var fullStackedChart = { pathData };

	return fullStackedChart;

});
