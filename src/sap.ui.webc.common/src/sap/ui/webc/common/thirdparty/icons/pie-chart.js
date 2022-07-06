sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pie-chart', './v4/pie-chart'], function (exports, Theme, pieChart$1, pieChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pieChart$1.pathData : pieChart$2.pathData;
	var pieChart = "pie-chart";

	exports.accData = pieChart$1.accData;
	exports.ltr = pieChart$1.ltr;
	exports.default = pieChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
