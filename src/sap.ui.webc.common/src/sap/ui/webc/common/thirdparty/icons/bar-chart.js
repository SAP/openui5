sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bar-chart', './v4/bar-chart'], function (Theme, barChart$2, barChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? barChart$1 : barChart$2;
	var barChart = { pathData };

	return barChart;

});
