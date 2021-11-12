sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/multiple-bar-chart', './v4/multiple-bar-chart'], function (Theme, multipleBarChart$2, multipleBarChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? multipleBarChart$1 : multipleBarChart$2;
	var multipleBarChart = { pathData };

	return multipleBarChart;

});
