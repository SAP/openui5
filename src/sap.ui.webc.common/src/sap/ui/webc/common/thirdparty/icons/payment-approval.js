sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/payment-approval', './v4/payment-approval'], function (Theme, paymentApproval$2, paymentApproval$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? paymentApproval$1 : paymentApproval$2;
	var paymentApproval = { pathData };

	return paymentApproval;

});
