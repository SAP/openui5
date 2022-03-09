sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/simple-payment', './v4/simple-payment'], function (Theme, simplePayment$2, simplePayment$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? simplePayment$1 : simplePayment$2;
	var simplePayment = { pathData };

	return simplePayment;

});
