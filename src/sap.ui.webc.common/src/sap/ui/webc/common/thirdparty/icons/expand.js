sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/expand', './v4/expand'], function (exports, Theme, expand$1, expand$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? expand$1.pathData : expand$2.pathData;
	var expand = "expand";

	exports.accData = expand$1.accData;
	exports.ltr = expand$1.ltr;
	exports.default = expand;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
