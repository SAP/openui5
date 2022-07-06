sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/lead-outdated', './v4/lead-outdated'], function (exports, Theme, leadOutdated$1, leadOutdated$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? leadOutdated$1.pathData : leadOutdated$2.pathData;
	var leadOutdated = "lead-outdated";

	exports.accData = leadOutdated$1.accData;
	exports.ltr = leadOutdated$1.ltr;
	exports.default = leadOutdated;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
