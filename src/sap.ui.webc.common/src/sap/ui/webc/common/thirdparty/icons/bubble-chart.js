sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bubble-chart', './v4/bubble-chart'], function (Theme, bubbleChart$2, bubbleChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? bubbleChart$1 : bubbleChart$2;
	var bubbleChart = { pathData };

	return bubbleChart;

});
