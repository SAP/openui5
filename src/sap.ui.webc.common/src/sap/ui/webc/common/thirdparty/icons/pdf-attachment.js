sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pdf-attachment', './v4/pdf-attachment'], function (exports, Theme, pdfAttachment$1, pdfAttachment$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pdfAttachment$1.pathData : pdfAttachment$2.pathData;
	var pdfAttachment = "pdf-attachment";

	exports.accData = pdfAttachment$1.accData;
	exports.ltr = pdfAttachment$1.ltr;
	exports.default = pdfAttachment;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
