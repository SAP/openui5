sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vertical-waterfall-chart', './v4/vertical-waterfall-chart'], function (Theme, verticalWaterfallChart$2, verticalWaterfallChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? verticalWaterfallChart$1 : verticalWaterfallChart$2;
	var verticalWaterfallChart = { pathData };

	return verticalWaterfallChart;

});
