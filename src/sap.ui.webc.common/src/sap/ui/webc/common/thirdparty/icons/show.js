sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/show', './v4/show'], function (exports, Theme, show$1, show$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? show$1.pathData : show$2.pathData;
	var show = "show";

	exports.accData = show$1.accData;
	exports.ltr = show$1.ltr;
	exports.default = show;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
