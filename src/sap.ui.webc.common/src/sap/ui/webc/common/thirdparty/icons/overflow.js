sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/overflow', './v4/overflow'], function (exports, Theme, overflow$1, overflow$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? overflow$1.pathData : overflow$2.pathData;
	var overflow = "overflow";

	exports.accData = overflow$1.accData;
	exports.ltr = overflow$1.ltr;
	exports.default = overflow;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
