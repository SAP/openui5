sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/horizontal-waterfall-chart', './v4/horizontal-waterfall-chart'], function (exports, Theme, horizontalWaterfallChart$1, horizontalWaterfallChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? horizontalWaterfallChart$1.pathData : horizontalWaterfallChart$2.pathData;
	var horizontalWaterfallChart = "horizontal-waterfall-chart";

	exports.accData = horizontalWaterfallChart$1.accData;
	exports.ltr = horizontalWaterfallChart$1.ltr;
	exports.default = horizontalWaterfallChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
