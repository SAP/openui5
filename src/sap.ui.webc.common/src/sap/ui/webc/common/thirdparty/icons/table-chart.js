sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/table-chart', './v4/table-chart'], function (Theme, tableChart$2, tableChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? tableChart$1 : tableChart$2;
	var tableChart = { pathData };

	return tableChart;

});
