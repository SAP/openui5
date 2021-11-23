sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/horizontal-stacked-chart', './v4/horizontal-stacked-chart'], function (Theme, horizontalStackedChart$2, horizontalStackedChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? horizontalStackedChart$1 : horizontalStackedChart$2;
	var horizontalStackedChart = { pathData };

	return horizontalStackedChart;

});
