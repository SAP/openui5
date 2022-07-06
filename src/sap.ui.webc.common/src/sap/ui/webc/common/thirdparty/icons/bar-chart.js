sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bar-chart', './v4/bar-chart'], function (exports, Theme, barChart$1, barChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? barChart$1.pathData : barChart$2.pathData;
	var barChart = "bar-chart";

	exports.accData = barChart$1.accData;
	exports.ltr = barChart$1.ltr;
	exports.default = barChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
