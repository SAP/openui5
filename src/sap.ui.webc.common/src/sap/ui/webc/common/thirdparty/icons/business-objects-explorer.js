sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/business-objects-explorer', './v4/business-objects-explorer'], function (Theme, businessObjectsExplorer$2, businessObjectsExplorer$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? businessObjectsExplorer$1 : businessObjectsExplorer$2;
	var businessObjectsExplorer = { pathData };

	return businessObjectsExplorer;

});
