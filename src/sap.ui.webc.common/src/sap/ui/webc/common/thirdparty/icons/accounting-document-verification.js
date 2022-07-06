sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/accounting-document-verification', './v4/accounting-document-verification'], function (exports, Theme, accountingDocumentVerification$1, accountingDocumentVerification$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? accountingDocumentVerification$1.pathData : accountingDocumentVerification$2.pathData;
	var accountingDocumentVerification = "accounting-document-verification";

	exports.accData = accountingDocumentVerification$1.accData;
	exports.ltr = accountingDocumentVerification$1.ltr;
	exports.default = accountingDocumentVerification;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
