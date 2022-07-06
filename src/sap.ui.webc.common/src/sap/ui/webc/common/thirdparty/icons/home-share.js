sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/home-share', './v4/home-share'], function (exports, Theme, homeShare$1, homeShare$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? homeShare$1.pathData : homeShare$2.pathData;
	var homeShare = "home-share";

	exports.accData = homeShare$1.accData;
	exports.ltr = homeShare$1.ltr;
	exports.default = homeShare;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
