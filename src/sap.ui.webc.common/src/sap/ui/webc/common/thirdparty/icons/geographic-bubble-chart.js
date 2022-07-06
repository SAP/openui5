sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/geographic-bubble-chart', './v4/geographic-bubble-chart'], function (exports, Theme, geographicBubbleChart$1, geographicBubbleChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? geographicBubbleChart$1.pathData : geographicBubbleChart$2.pathData;
	var geographicBubbleChart = "geographic-bubble-chart";

	exports.accData = geographicBubbleChart$1.accData;
	exports.ltr = geographicBubbleChart$1.ltr;
	exports.default = geographicBubbleChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
