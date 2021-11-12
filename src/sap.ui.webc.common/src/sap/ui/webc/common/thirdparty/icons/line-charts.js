sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/line-charts', './v4/line-charts'], function (Theme, lineCharts$2, lineCharts$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? lineCharts$1 : lineCharts$2;
	var lineCharts = { pathData };

	return lineCharts;

});
