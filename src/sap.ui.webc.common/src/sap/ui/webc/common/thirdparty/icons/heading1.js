sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/heading1', './v4/heading1'], function (exports, Theme, heading1$1, heading1$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? heading1$1.pathData : heading1$2.pathData;
	var heading1 = "heading1";

	exports.accData = heading1$1.accData;
	exports.ltr = heading1$1.ltr;
	exports.default = heading1;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
