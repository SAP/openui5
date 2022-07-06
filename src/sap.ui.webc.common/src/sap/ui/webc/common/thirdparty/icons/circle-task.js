sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/circle-task', './v4/circle-task'], function (exports, Theme, circleTask$1, circleTask$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? circleTask$1.pathData : circleTask$2.pathData;
	var circleTask = "circle-task";

	exports.accData = circleTask$1.accData;
	exports.ltr = circleTask$1.ltr;
	exports.default = circleTask;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
