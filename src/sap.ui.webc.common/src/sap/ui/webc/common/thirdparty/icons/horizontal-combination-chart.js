sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/horizontal-combination-chart', './v4/horizontal-combination-chart'], function (exports, Theme, horizontalCombinationChart$1, horizontalCombinationChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? horizontalCombinationChart$1.pathData : horizontalCombinationChart$2.pathData;
	var horizontalCombinationChart = "horizontal-combination-chart";

	exports.accData = horizontalCombinationChart$1.accData;
	exports.ltr = horizontalCombinationChart$1.ltr;
	exports.default = horizontalCombinationChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
