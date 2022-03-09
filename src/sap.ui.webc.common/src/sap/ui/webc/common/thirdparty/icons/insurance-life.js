sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/insurance-life', './v4/insurance-life'], function (Theme, insuranceLife$2, insuranceLife$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? insuranceLife$1 : insuranceLife$2;
	var insuranceLife = { pathData };

	return insuranceLife;

});
