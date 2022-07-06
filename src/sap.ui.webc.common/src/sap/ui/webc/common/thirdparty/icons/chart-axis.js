sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/chart-axis', './v4/chart-axis'], function (exports, Theme, chartAxis$1, chartAxis$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? chartAxis$1.pathData : chartAxis$2.pathData;
	var chartAxis = "chart-axis";

	exports.accData = chartAxis$1.accData;
	exports.ltr = chartAxis$1.ltr;
	exports.default = chartAxis;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
