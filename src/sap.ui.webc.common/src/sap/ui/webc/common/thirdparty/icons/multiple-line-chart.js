sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/multiple-line-chart', './v4/multiple-line-chart'], function (exports, Theme, multipleLineChart$1, multipleLineChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? multipleLineChart$1.pathData : multipleLineChart$2.pathData;
	var multipleLineChart = "multiple-line-chart";

	exports.accData = multipleLineChart$1.accData;
	exports.ltr = multipleLineChart$1.ltr;
	exports.default = multipleLineChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
