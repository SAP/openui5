sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/org-chart', './v4/org-chart'], function (exports, Theme, orgChart$1, orgChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? orgChart$1.pathData : orgChart$2.pathData;
	var orgChart = "org-chart";

	exports.accData = orgChart$1.accData;
	exports.ltr = orgChart$1.ltr;
	exports.default = orgChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
