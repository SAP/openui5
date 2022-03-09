sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vertical-bullet-chart', './v4/vertical-bullet-chart'], function (Theme, verticalBulletChart$2, verticalBulletChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? verticalBulletChart$1 : verticalBulletChart$2;
	var verticalBulletChart = { pathData };

	return verticalBulletChart;

});
