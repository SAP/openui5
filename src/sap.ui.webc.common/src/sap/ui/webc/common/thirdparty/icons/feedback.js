sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/feedback', './v4/feedback'], function (exports, Theme, feedback$1, feedback$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? feedback$1.pathData : feedback$2.pathData;
	var feedback = "feedback";

	exports.accData = feedback$1.accData;
	exports.ltr = feedback$1.ltr;
	exports.default = feedback;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
