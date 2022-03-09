sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/business-objects-mobile', './v4/business-objects-mobile'], function (Theme, businessObjectsMobile$2, businessObjectsMobile$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? businessObjectsMobile$1 : businessObjectsMobile$2;
	var businessObjectsMobile = { pathData };

	return businessObjectsMobile;

});
