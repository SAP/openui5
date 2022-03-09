sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/batch-payments', './v4/batch-payments'], function (Theme, batchPayments$2, batchPayments$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? batchPayments$1 : batchPayments$2;
	var batchPayments = { pathData };

	return batchPayments;

});
