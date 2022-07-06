sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/source-code', './v4/source-code'], function (exports, Theme, sourceCode$1, sourceCode$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sourceCode$1.pathData : sourceCode$2.pathData;
	var sourceCode = "source-code";

	exports.accData = sourceCode$1.accData;
	exports.ltr = sourceCode$1.ltr;
	exports.default = sourceCode;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
