sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/menu2', './v4/menu2'], function (exports, Theme, menu2$1, menu2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? menu2$1.pathData : menu2$2.pathData;
	var menu2 = "menu2";

	exports.accData = menu2$1.accData;
	exports.ltr = menu2$1.ltr;
	exports.default = menu2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
