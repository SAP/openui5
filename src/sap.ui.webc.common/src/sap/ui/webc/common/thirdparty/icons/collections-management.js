sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/collections-management', './v4/collections-management'], function (Theme, collectionsManagement$2, collectionsManagement$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? collectionsManagement$1 : collectionsManagement$2;
	var collectionsManagement = { pathData };

	return collectionsManagement;

});
