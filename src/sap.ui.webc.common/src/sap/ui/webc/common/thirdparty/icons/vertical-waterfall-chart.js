sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vertical-waterfall-chart', './v4/vertical-waterfall-chart'], function (exports, Theme, verticalWaterfallChart$1, verticalWaterfallChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? verticalWaterfallChart$1.pathData : verticalWaterfallChart$2.pathData;
	var verticalWaterfallChart = "vertical-waterfall-chart";

	exports.accData = verticalWaterfallChart$1.accData;
	exports.ltr = verticalWaterfallChart$1.ltr;
	exports.default = verticalWaterfallChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
