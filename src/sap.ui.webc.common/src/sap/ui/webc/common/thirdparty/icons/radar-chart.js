sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/radar-chart', './v4/radar-chart'], function (exports, Theme, radarChart$1, radarChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? radarChart$1.pathData : radarChart$2.pathData;
	var radarChart = "radar-chart";

	exports.accData = radarChart$1.accData;
	exports.ltr = radarChart$1.ltr;
	exports.default = radarChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
