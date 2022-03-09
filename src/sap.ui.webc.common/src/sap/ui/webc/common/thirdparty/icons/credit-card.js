sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/credit-card', './v4/credit-card'], function (Theme, creditCard$2, creditCard$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? creditCard$1 : creditCard$2;
	var creditCard = { pathData };

	return creditCard;

});
