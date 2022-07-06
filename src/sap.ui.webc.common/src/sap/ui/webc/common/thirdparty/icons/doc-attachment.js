sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/doc-attachment', './v4/doc-attachment'], function (exports, Theme, docAttachment$1, docAttachment$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? docAttachment$1.pathData : docAttachment$2.pathData;
	var docAttachment = "doc-attachment";

	exports.accData = docAttachment$1.accData;
	exports.ltr = docAttachment$1.ltr;
	exports.default = docAttachment;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
