sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/background', './v4/background'], function (exports, Theme, background$1, background$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? background$1.pathData : background$2.pathData;
	var background = "background";

	exports.accData = background$1.accData;
	exports.ltr = background$1.ltr;
	exports.default = background;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
