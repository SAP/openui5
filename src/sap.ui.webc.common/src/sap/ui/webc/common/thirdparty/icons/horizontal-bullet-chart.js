sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/horizontal-bullet-chart', './v4/horizontal-bullet-chart'], function (exports, Theme, horizontalBulletChart$1, horizontalBulletChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? horizontalBulletChart$1.pathData : horizontalBulletChart$2.pathData;
	var horizontalBulletChart = "horizontal-bullet-chart";

	exports.accData = horizontalBulletChart$1.accData;
	exports.ltr = horizontalBulletChart$1.ltr;
	exports.default = horizontalBulletChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
