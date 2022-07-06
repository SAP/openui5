sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pdf-reader', './v4/pdf-reader'], function (exports, Theme, pdfReader$1, pdfReader$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pdfReader$1.pathData : pdfReader$2.pathData;
	var pdfReader = "pdf-reader";

	exports.accData = pdfReader$1.accData;
	exports.ltr = pdfReader$1.ltr;
	exports.default = pdfReader;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
