sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/business-objects-experience', './v4/business-objects-experience'], function (Theme, businessObjectsExperience$2, businessObjectsExperience$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? businessObjectsExperience$1 : businessObjectsExperience$2;
	var businessObjectsExperience = { pathData };

	return businessObjectsExperience;

});
