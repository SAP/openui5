sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/area-chart', './v4/area-chart'], function (Theme, areaChart$2, areaChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? areaChart$1 : areaChart$2;
	var areaChart = { pathData };

	return areaChart;

});
