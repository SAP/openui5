sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/commission-check', './v4/commission-check'], function (Theme, commissionCheck$2, commissionCheck$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? commissionCheck$1 : commissionCheck$2;
	var commissionCheck = { pathData };

	return commissionCheck;

});
