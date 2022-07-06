sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/wounds-doc', './v4/wounds-doc'], function (exports, Theme, woundsDoc$1, woundsDoc$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? woundsDoc$1.pathData : woundsDoc$2.pathData;
	var woundsDoc = "wounds-doc";

	exports.accData = woundsDoc$1.accData;
	exports.ltr = woundsDoc$1.ltr;
	exports.default = woundsDoc;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
