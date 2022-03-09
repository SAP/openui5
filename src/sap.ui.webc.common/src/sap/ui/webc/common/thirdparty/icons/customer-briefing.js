sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer-briefing', './v4/customer-briefing'], function (Theme, customerBriefing$2, customerBriefing$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? customerBriefing$1 : customerBriefing$2;
	var customerBriefing = { pathData };

	return customerBriefing;

});
