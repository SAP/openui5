sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/x-ray', './v4/x-ray'], function (exports, Theme, xRay$1, xRay$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? xRay$1.pathData : xRay$2.pathData;
	var xRay = "x-ray";

	exports.accData = xRay$1.accData;
	exports.ltr = xRay$1.ltr;
	exports.default = xRay;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
