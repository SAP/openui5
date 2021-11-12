sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pie-chart', './v4/pie-chart'], function (Theme, pieChart$2, pieChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? pieChart$1 : pieChart$2;
	var pieChart = { pathData };

	return pieChart;

});
