sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/circle-task-2', './v4/circle-task-2'], function (exports, Theme, circleTask2$1, circleTask2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? circleTask2$1.pathData : circleTask2$2.pathData;
	var circleTask2 = "circle-task-2";

	exports.accData = circleTask2$1.accData;
	exports.ltr = circleTask2$1.ltr;
	exports.default = circleTask2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
