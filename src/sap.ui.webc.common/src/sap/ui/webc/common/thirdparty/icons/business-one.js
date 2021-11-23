sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/business-one', './v4/business-one'], function (Theme, businessOne$2, businessOne$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? businessOne$1 : businessOne$2;
	var businessOne = { pathData };

	return businessOne;

});
