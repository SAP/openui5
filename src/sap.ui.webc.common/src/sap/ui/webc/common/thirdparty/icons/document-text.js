sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/document-text', './v4/document-text'], function (exports, Theme, documentText$1, documentText$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? documentText$1.pathData : documentText$2.pathData;
	var documentText = "document-text";

	exports.accData = documentText$1.accData;
	exports.ltr = documentText$1.ltr;
	exports.default = documentText;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
