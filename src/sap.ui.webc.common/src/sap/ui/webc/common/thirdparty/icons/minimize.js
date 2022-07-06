sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/minimize', './v4/minimize'], function (exports, Theme, minimize$1, minimize$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? minimize$1.pathData : minimize$2.pathData;
	var minimize = "minimize";

	exports.accData = minimize$1.accData;
	exports.ltr = minimize$1.ltr;
	exports.default = minimize;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
