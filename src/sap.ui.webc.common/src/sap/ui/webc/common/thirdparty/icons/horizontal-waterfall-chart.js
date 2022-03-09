sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/horizontal-waterfall-chart', './v4/horizontal-waterfall-chart'], function (Theme, horizontalWaterfallChart$2, horizontalWaterfallChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? horizontalWaterfallChart$1 : horizontalWaterfallChart$2;
	var horizontalWaterfallChart = { pathData };

	return horizontalWaterfallChart;

});
