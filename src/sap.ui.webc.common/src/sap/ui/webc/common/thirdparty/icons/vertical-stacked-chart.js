sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vertical-stacked-chart', './v4/vertical-stacked-chart'], function (Theme, verticalStackedChart$2, verticalStackedChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? verticalStackedChart$1 : verticalStackedChart$2;
	var verticalStackedChart = { pathData };

	return verticalStackedChart;

});
