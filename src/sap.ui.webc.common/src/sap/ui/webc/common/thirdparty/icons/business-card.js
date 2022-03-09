sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/business-card', './v4/business-card'], function (Theme, businessCard$2, businessCard$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? businessCard$1 : businessCard$2;
	var businessCard = { pathData };

	return businessCard;

});
