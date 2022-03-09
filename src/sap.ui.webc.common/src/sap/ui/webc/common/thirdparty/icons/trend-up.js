sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/trend-up', './v4/trend-up'], function (Theme, trendUp$2, trendUp$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? trendUp$1 : trendUp$2;
	var trendUp = { pathData };

	return trendUp;

});
