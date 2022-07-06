sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/iphone', './v4/iphone'], function (exports, Theme, iphone$1, iphone$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? iphone$1.pathData : iphone$2.pathData;
	var iphone = "iphone";

	exports.accData = iphone$1.accData;
	exports.ltr = iphone$1.ltr;
	exports.default = iphone;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
