sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/multiple-pie-chart', './v4/multiple-pie-chart'], function (Theme, multiplePieChart$2, multiplePieChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? multiplePieChart$1 : multiplePieChart$2;
	var multiplePieChart = { pathData };

	return multiplePieChart;

});
