sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/print', './v4/print'], function (exports, Theme, print$1, print$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? print$1.pathData : print$2.pathData;
	var print = "print";

	exports.accData = print$1.accData;
	exports.ltr = print$1.ltr;
	exports.default = print;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
