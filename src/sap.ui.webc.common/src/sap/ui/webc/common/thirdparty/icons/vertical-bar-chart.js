sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vertical-bar-chart', './v4/vertical-bar-chart'], function (exports, Theme, verticalBarChart$1, verticalBarChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? verticalBarChart$1.pathData : verticalBarChart$2.pathData;
	var verticalBarChart = "vertical-bar-chart";

	exports.accData = verticalBarChart$1.accData;
	exports.ltr = verticalBarChart$1.ltr;
	exports.default = verticalBarChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
