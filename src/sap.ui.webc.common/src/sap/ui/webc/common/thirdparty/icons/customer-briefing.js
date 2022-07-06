sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer-briefing', './v4/customer-briefing'], function (exports, Theme, customerBriefing$1, customerBriefing$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? customerBriefing$1.pathData : customerBriefing$2.pathData;
	var customerBriefing = "customer-briefing";

	exports.accData = customerBriefing$1.accData;
	exports.ltr = customerBriefing$1.ltr;
	exports.default = customerBriefing;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
