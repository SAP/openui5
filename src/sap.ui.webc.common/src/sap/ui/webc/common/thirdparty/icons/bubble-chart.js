sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bubble-chart', './v4/bubble-chart'], function (exports, Theme, bubbleChart$1, bubbleChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? bubbleChart$1.pathData : bubbleChart$2.pathData;
	var bubbleChart = "bubble-chart";

	exports.accData = bubbleChart$1.accData;
	exports.ltr = bubbleChart$1.ltr;
	exports.default = bubbleChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
