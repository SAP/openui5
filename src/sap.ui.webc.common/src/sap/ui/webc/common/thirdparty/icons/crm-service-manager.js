sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/crm-service-manager', './v4/crm-service-manager'], function (exports, Theme, crmServiceManager$1, crmServiceManager$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? crmServiceManager$1.pathData : crmServiceManager$2.pathData;
	var crmServiceManager = "crm-service-manager";

	exports.accData = crmServiceManager$1.accData;
	exports.ltr = crmServiceManager$1.ltr;
	exports.default = crmServiceManager;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
