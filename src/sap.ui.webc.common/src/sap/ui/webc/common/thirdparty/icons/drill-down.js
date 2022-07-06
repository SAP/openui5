sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/drill-down', './v4/drill-down'], function (exports, Theme, drillDown$1, drillDown$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? drillDown$1.pathData : drillDown$2.pathData;
	var drillDown = "drill-down";

	exports.accData = drillDown$1.accData;
	exports.ltr = drillDown$1.ltr;
	exports.default = drillDown;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
