sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/ipad-2', './v4/ipad-2'], function (exports, Theme, ipad2$1, ipad2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? ipad2$1.pathData : ipad2$2.pathData;
	var ipad2 = "ipad-2";

	exports.accData = ipad2$1.accData;
	exports.ltr = ipad2$1.ltr;
	exports.default = ipad2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
