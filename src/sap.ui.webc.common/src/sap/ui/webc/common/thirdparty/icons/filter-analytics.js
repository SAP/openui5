sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/filter-analytics', './v4/filter-analytics'], function (Theme, filterAnalytics$2, filterAnalytics$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? filterAnalytics$1 : filterAnalytics$2;
	var filterAnalytics = { pathData };

	return filterAnalytics;

});
