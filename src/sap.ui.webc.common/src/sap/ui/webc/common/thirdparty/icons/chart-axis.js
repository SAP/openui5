sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/chart-axis', './v4/chart-axis'], function (Theme, chartAxis$2, chartAxis$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? chartAxis$1 : chartAxis$2;
	var chartAxis = { pathData };

	return chartAxis;

});
