sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/along-stacked-chart', './v4/along-stacked-chart'], function (Theme, alongStackedChart$2, alongStackedChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? alongStackedChart$1 : alongStackedChart$2;
	var alongStackedChart = { pathData };

	return alongStackedChart;

});
