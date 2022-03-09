sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/family-protection', './v4/family-protection'], function (Theme, familyProtection$2, familyProtection$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? familyProtection$1 : familyProtection$2;
	var familyProtection = { pathData };

	return familyProtection;

});
