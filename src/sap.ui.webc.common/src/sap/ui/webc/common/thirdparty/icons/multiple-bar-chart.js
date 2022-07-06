sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/multiple-bar-chart', './v4/multiple-bar-chart'], function (exports, Theme, multipleBarChart$1, multipleBarChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? multipleBarChart$1.pathData : multipleBarChart$2.pathData;
	var multipleBarChart = "multiple-bar-chart";

	exports.accData = multipleBarChart$1.accData;
	exports.ltr = multipleBarChart$1.ltr;
	exports.default = multipleBarChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
