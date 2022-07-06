sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment-html', './v4/attachment-html'], function (exports, Theme, attachmentHtml$1, attachmentHtml$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? attachmentHtml$1.pathData : attachmentHtml$2.pathData;
	var attachmentHtml = "attachment-html";

	exports.accData = attachmentHtml$1.accData;
	exports.ltr = attachmentHtml$1.ltr;
	exports.default = attachmentHtml;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
