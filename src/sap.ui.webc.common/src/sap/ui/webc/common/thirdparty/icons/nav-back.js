sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/nav-back', './v4/nav-back'], function (exports, Theme, navBack$1, navBack$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? navBack$1.pathData : navBack$2.pathData;
	var navBack = "nav-back";

	exports.accData = navBack$1.accData;
	exports.ltr = navBack$1.ltr;
	exports.default = navBack;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
