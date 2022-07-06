sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/iphone-2', './v4/iphone-2'], function (exports, Theme, iphone2$1, iphone2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? iphone2$1.pathData : iphone2$2.pathData;
	var iphone2 = "iphone-2";

	exports.accData = iphone2$1.accData;
	exports.ltr = iphone2$1.ltr;
	exports.default = iphone2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
