sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bo-strategy-management', './v4/bo-strategy-management'], function (Theme, boStrategyManagement$2, boStrategyManagement$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? boStrategyManagement$1 : boStrategyManagement$2;
	var boStrategyManagement = { pathData };

	return boStrategyManagement;

});
