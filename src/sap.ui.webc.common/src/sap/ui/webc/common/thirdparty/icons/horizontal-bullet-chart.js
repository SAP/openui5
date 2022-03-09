sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/horizontal-bullet-chart', './v4/horizontal-bullet-chart'], function (Theme, horizontalBulletChart$2, horizontalBulletChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? horizontalBulletChart$1 : horizontalBulletChart$2;
	var horizontalBulletChart = { pathData };

	return horizontalBulletChart;

});
