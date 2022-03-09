sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/line-chart', './v4/line-chart'], function (Theme, lineChart$2, lineChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? lineChart$1 : lineChart$2;
	var lineChart = { pathData };

	return lineChart;

});
