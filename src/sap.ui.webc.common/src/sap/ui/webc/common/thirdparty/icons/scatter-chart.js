sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/scatter-chart', './v4/scatter-chart'], function (Theme, scatterChart$2, scatterChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? scatterChart$1 : scatterChart$2;
	var scatterChart = { pathData };

	return scatterChart;

});
