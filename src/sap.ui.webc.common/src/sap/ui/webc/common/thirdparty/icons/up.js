sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/up', './v4/up'], function (exports, Theme, up$1, up$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? up$1.pathData : up$2.pathData;
	var up = "up";

	exports.accData = up$1.accData;
	exports.ltr = up$1.ltr;
	exports.default = up;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
