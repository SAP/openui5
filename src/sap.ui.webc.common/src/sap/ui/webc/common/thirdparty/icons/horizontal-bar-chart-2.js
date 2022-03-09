sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/horizontal-bar-chart-2', './v4/horizontal-bar-chart-2'], function (Theme, horizontalBarChart2$2, horizontalBarChart2$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? horizontalBarChart2$1 : horizontalBarChart2$2;
	var horizontalBarChart2 = { pathData };

	return horizontalBarChart2;

});
