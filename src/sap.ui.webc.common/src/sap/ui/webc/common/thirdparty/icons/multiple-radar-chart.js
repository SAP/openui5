sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/multiple-radar-chart', './v4/multiple-radar-chart'], function (exports, Theme, multipleRadarChart$1, multipleRadarChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? multipleRadarChart$1.pathData : multipleRadarChart$2.pathData;
	var multipleRadarChart = "multiple-radar-chart";

	exports.accData = multipleRadarChart$1.accData;
	exports.ltr = multipleRadarChart$1.ltr;
	exports.default = multipleRadarChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
