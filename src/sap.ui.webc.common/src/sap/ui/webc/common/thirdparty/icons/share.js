sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/share', './v4/share'], function (exports, Theme, share$1, share$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? share$1.pathData : share$2.pathData;
	var share = "share";

	exports.accData = share$1.accData;
	exports.ltr = share$1.ltr;
	exports.default = share;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
