sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/insurance-house', './v4/insurance-house'], function (Theme, insuranceHouse$2, insuranceHouse$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? insuranceHouse$1 : insuranceHouse$2;
	var insuranceHouse = { pathData };

	return insuranceHouse;

});
