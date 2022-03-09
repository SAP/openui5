sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/family-care', './v4/family-care'], function (Theme, familyCare$2, familyCare$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? familyCare$1 : familyCare$2;
	var familyCare = { pathData };

	return familyCare;

});
