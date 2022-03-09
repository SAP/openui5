sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/trend-down', './v4/trend-down'], function (Theme, trendDown$2, trendDown$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? trendDown$1 : trendDown$2;
	var trendDown = { pathData };

	return trendDown;

});
