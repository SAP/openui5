sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/crm-service-manager', './v4/crm-service-manager'], function (Theme, crmServiceManager$2, crmServiceManager$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? crmServiceManager$1 : crmServiceManager$2;
	var crmServiceManager = { pathData };

	return crmServiceManager;

});
