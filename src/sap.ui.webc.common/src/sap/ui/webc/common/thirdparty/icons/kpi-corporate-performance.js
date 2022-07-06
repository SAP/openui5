sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/kpi-corporate-performance', './v4/kpi-corporate-performance'], function (exports, Theme, kpiCorporatePerformance$1, kpiCorporatePerformance$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? kpiCorporatePerformance$1.pathData : kpiCorporatePerformance$2.pathData;
	var kpiCorporatePerformance = "kpi-corporate-performance";

	exports.accData = kpiCorporatePerformance$1.accData;
	exports.ltr = kpiCorporatePerformance$1.ltr;
	exports.default = kpiCorporatePerformance;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
