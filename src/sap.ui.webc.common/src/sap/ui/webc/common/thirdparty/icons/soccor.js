sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/soccor', './v4/soccor'], function (exports, Theme, soccor$1, soccor$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? soccor$1.pathData : soccor$2.pathData;
	var soccor = "soccor";

	exports.accData = soccor$1.accData;
	exports.ltr = soccor$1.ltr;
	exports.default = soccor;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
