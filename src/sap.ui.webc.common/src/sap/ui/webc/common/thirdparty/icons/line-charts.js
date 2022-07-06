sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/line-charts', './v4/line-charts'], function (exports, Theme, lineCharts$1, lineCharts$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? lineCharts$1.pathData : lineCharts$2.pathData;
	var lineCharts = "line-charts";

	exports.accData = lineCharts$1.accData;
	exports.ltr = lineCharts$1.ltr;
	exports.default = lineCharts;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
