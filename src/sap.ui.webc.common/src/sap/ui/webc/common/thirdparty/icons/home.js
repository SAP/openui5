sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/home', './v4/home'], function (exports, Theme, home$1, home$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? home$1.pathData : home$2.pathData;
	var home = "home";

	exports.accData = home$1.accData;
	exports.ltr = home$1.ltr;
	exports.default = home;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
