sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/arrow-top', './v4/arrow-top'], function (exports, Theme, arrowTop$1, arrowTop$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? arrowTop$1.pathData : arrowTop$2.pathData;
	var arrowTop = "arrow-top";

	exports.accData = arrowTop$1.accData;
	exports.ltr = arrowTop$1.ltr;
	exports.default = arrowTop;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
