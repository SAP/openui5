sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/business-by-design', './v4/business-by-design'], function (Theme, businessByDesign$2, businessByDesign$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? businessByDesign$1 : businessByDesign$2;
	var businessByDesign = { pathData };

	return businessByDesign;

});
