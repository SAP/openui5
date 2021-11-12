sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/chart-table-view', './v4/chart-table-view'], function (Theme, chartTableView$2, chartTableView$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? chartTableView$1 : chartTableView$2;
	var chartTableView = { pathData };

	return chartTableView;

});
