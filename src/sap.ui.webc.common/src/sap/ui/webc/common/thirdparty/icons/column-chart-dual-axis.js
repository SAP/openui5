sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/column-chart-dual-axis', './v4/column-chart-dual-axis'], function (Theme, columnChartDualAxis$2, columnChartDualAxis$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? columnChartDualAxis$1 : columnChartDualAxis$2;
	var columnChartDualAxis = { pathData };

	return columnChartDualAxis;

});
