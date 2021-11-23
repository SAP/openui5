sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/accounting-document-verification', './v4/accounting-document-verification'], function (Theme, accountingDocumentVerification$2, accountingDocumentVerification$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? accountingDocumentVerification$1 : accountingDocumentVerification$2;
	var accountingDocumentVerification = { pathData };

	return accountingDocumentVerification;

});
