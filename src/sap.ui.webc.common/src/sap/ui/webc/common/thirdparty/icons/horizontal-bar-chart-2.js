sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/horizontal-bar-chart-2', './v4/horizontal-bar-chart-2'], function (exports, Theme, horizontalBarChart2$1, horizontalBarChart2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? horizontalBarChart2$1.pathData : horizontalBarChart2$2.pathData;
	var horizontalBarChart2 = "horizontal-bar-chart-2";

	exports.accData = horizontalBarChart2$1.accData;
	exports.ltr = horizontalBarChart2$1.ltr;
	exports.default = horizontalBarChart2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
