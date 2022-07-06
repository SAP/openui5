sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/drill-up', './v4/drill-up'], function (exports, Theme, drillUp$1, drillUp$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? drillUp$1.pathData : drillUp$2.pathData;
	var drillUp = "drill-up";

	exports.accData = drillUp$1.accData;
	exports.ltr = drillUp$1.ltr;
	exports.default = drillUp;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
