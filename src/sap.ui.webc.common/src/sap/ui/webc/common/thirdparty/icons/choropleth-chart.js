sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/choropleth-chart', './v4/choropleth-chart'], function (Theme, choroplethChart$2, choroplethChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? choroplethChart$1 : choroplethChart$2;
	var choroplethChart = { pathData };

	return choroplethChart;

});
