sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/multiple-radar-chart', './v4/multiple-radar-chart'], function (Theme, multipleRadarChart$2, multipleRadarChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? multipleRadarChart$1 : multipleRadarChart$2;
	var multipleRadarChart = { pathData };

	return multipleRadarChart;

});
