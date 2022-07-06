sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/syntax', './v4/syntax'], function (exports, Theme, syntax$1, syntax$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? syntax$1.pathData : syntax$2.pathData;
	var syntax = "syntax";

	exports.accData = syntax$1.accData;
	exports.ltr = syntax$1.ltr;
	exports.default = syntax;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
