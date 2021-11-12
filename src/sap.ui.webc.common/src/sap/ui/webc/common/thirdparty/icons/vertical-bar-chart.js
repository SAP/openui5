sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vertical-bar-chart', './v4/vertical-bar-chart'], function (Theme, verticalBarChart$2, verticalBarChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? verticalBarChart$1 : verticalBarChart$2;
	var verticalBarChart = { pathData };

	return verticalBarChart;

});
