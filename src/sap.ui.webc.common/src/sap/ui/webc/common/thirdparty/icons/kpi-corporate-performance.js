sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/kpi-corporate-performance', './v4/kpi-corporate-performance'], function (Theme, kpiCorporatePerformance$2, kpiCorporatePerformance$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? kpiCorporatePerformance$1 : kpiCorporatePerformance$2;
	var kpiCorporatePerformance = { pathData };

	return kpiCorporatePerformance;

});
