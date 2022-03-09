sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/line-chart-dual-axis', './v4/line-chart-dual-axis'], function (Theme, lineChartDualAxis$2, lineChartDualAxis$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? lineChartDualAxis$1 : lineChartDualAxis$2;
	var lineChartDualAxis = { pathData };

	return lineChartDualAxis;

});
