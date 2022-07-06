sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/display', './v4/display'], function (exports, Theme, display$1, display$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? display$1.pathData : display$2.pathData;
	var display = "display";

	exports.accData = display$1.accData;
	exports.ltr = display$1.ltr;
	exports.default = display;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
