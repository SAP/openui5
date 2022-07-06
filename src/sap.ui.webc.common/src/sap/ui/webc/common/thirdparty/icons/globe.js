sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/globe', './v4/globe'], function (exports, Theme, globe$1, globe$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? globe$1.pathData : globe$2.pathData;
	var globe = "globe";

	exports.accData = globe$1.accData;
	exports.ltr = globe$1.ltr;
	exports.default = globe;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
