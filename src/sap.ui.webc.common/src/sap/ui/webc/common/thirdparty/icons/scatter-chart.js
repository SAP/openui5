sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/scatter-chart', './v4/scatter-chart'], function (exports, Theme, scatterChart$1, scatterChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? scatterChart$1.pathData : scatterChart$2.pathData;
	var scatterChart = "scatter-chart";

	exports.accData = scatterChart$1.accData;
	exports.ltr = scatterChart$1.ltr;
	exports.default = scatterChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
