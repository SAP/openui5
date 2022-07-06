sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/goalseek', './v4/goalseek'], function (exports, Theme, goalseek$1, goalseek$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? goalseek$1.pathData : goalseek$2.pathData;
	var goalseek = "goalseek";

	exports.accData = goalseek$1.accData;
	exports.ltr = goalseek$1.ltr;
	exports.default = goalseek;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
