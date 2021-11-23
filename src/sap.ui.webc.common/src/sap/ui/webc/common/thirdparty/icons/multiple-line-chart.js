sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/multiple-line-chart', './v4/multiple-line-chart'], function (Theme, multipleLineChart$2, multipleLineChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? multipleLineChart$1 : multipleLineChart$2;
	var multipleLineChart = { pathData };

	return multipleLineChart;

});
