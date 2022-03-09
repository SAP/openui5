sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/radar-chart', './v4/radar-chart'], function (Theme, radarChart$2, radarChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? radarChart$1 : radarChart$2;
	var radarChart = { pathData };

	return radarChart;

});
