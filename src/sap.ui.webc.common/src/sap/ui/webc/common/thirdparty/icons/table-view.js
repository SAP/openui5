sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/table-view', './v4/table-view'], function (Theme, tableView$2, tableView$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? tableView$1 : tableView$2;
	var tableView = { pathData };

	return tableView;

});
