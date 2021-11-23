sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/horizontal-combination-chart', './v4/horizontal-combination-chart'], function (Theme, horizontalCombinationChart$2, horizontalCombinationChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? horizontalCombinationChart$1 : horizontalCombinationChart$2;
	var horizontalCombinationChart = { pathData };

	return horizontalCombinationChart;

});
