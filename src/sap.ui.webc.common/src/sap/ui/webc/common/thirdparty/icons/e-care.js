sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/e-care', './v4/e-care'], function (exports, Theme, eCare$1, eCare$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? eCare$1.pathData : eCare$2.pathData;
	var eCare = "e-care";

	exports.accData = eCare$1.accData;
	exports.ltr = eCare$1.ltr;
	exports.default = eCare;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
