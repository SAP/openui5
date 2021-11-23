sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vertical-bar-chart-2', './v4/vertical-bar-chart-2'], function (Theme, verticalBarChart2$2, verticalBarChart2$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? verticalBarChart2$1 : verticalBarChart2$2;
	var verticalBarChart2 = { pathData };

	return verticalBarChart2;

});
