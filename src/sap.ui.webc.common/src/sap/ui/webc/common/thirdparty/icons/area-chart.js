sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/area-chart', './v4/area-chart'], function (exports, Theme, areaChart$1, areaChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? areaChart$1.pathData : areaChart$2.pathData;
	var areaChart = "area-chart";

	exports.accData = areaChart$1.accData;
	exports.ltr = areaChart$1.ltr;
	exports.default = areaChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
