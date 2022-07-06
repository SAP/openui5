sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/lightbulb', './v4/lightbulb'], function (exports, Theme, lightbulb$1, lightbulb$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? lightbulb$1.pathData : lightbulb$2.pathData;
	var lightbulb = "lightbulb";

	exports.accData = lightbulb$1.accData;
	exports.ltr = lightbulb$1.ltr;
	exports.default = lightbulb;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
