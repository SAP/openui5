sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/menu', './v4/menu'], function (exports, Theme, menu$1, menu$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? menu$1.pathData : menu$2.pathData;
	var menu = "menu";

	exports.accData = menu$1.accData;
	exports.ltr = menu$1.ltr;
	exports.default = menu;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
