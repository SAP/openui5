sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/company-view', './v4/company-view'], function (Theme, companyView$2, companyView$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? companyView$1 : companyView$2;
	var companyView = { pathData };

	return companyView;

});
