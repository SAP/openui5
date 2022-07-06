sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/ipad', './v4/ipad'], function (exports, Theme, ipad$1, ipad$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? ipad$1.pathData : ipad$2.pathData;
	var ipad = "ipad";

	exports.accData = ipad$1.accData;
	exports.ltr = ipad$1.ltr;
	exports.default = ipad;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
