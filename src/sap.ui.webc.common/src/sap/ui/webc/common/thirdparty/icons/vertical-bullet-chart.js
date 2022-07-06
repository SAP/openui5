sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vertical-bullet-chart', './v4/vertical-bullet-chart'], function (exports, Theme, verticalBulletChart$1, verticalBulletChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? verticalBulletChart$1.pathData : verticalBulletChart$2.pathData;
	var verticalBulletChart = "vertical-bullet-chart";

	exports.accData = verticalBulletChart$1.accData;
	exports.ltr = verticalBulletChart$1.ltr;
	exports.default = verticalBulletChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
