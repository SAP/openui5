sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/upstacked-chart', './v4/upstacked-chart'], function (Theme, upstackedChart$2, upstackedChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? upstackedChart$1 : upstackedChart$2;
	var upstackedChart = { pathData };

	return upstackedChart;

});
