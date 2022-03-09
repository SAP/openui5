sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/marketing-campaign', './v4/marketing-campaign'], function (Theme, marketingCampaign$2, marketingCampaign$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? marketingCampaign$1 : marketingCampaign$2;
	var marketingCampaign = { pathData };

	return marketingCampaign;

});
