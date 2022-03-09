sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/clear-filter', './v4/clear-filter'], function (Theme, clearFilter$2, clearFilter$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? clearFilter$1 : clearFilter$2;
	var clearFilter = { pathData };

	return clearFilter;

});
