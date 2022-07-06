sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/back-to-top', './v4/back-to-top'], function (exports, Theme, backToTop$1, backToTop$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? backToTop$1.pathData : backToTop$2.pathData;
	var backToTop = "back-to-top";

	exports.accData = backToTop$1.accData;
	exports.ltr = backToTop$1.ltr;
	exports.default = backToTop;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
