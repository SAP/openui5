sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/marketing-campaign', './v4/marketing-campaign'], function (exports, Theme, marketingCampaign$1, marketingCampaign$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? marketingCampaign$1.pathData : marketingCampaign$2.pathData;
	var marketingCampaign = "marketing-campaign";

	exports.accData = marketingCampaign$1.accData;
	exports.ltr = marketingCampaign$1.ltr;
	exports.default = marketingCampaign;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
