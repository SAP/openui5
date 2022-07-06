sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/flag-2', './v4/flag-2'], function (exports, Theme, flag2$1, flag2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? flag2$1.pathData : flag2$2.pathData;
	var flag2 = "flag-2";

	exports.accData = flag2$1.accData;
	exports.ltr = flag2$1.ltr;
	exports.default = flag2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
