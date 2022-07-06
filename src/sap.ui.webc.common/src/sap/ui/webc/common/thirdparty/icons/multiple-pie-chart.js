sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/multiple-pie-chart', './v4/multiple-pie-chart'], function (exports, Theme, multiplePieChart$1, multiplePieChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? multiplePieChart$1.pathData : multiplePieChart$2.pathData;
	var multiplePieChart = "multiple-pie-chart";

	exports.accData = multiplePieChart$1.accData;
	exports.ltr = multiplePieChart$1.ltr;
	exports.default = multiplePieChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
