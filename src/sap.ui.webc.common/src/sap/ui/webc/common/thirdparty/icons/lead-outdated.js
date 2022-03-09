sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/lead-outdated', './v4/lead-outdated'], function (Theme, leadOutdated$2, leadOutdated$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? leadOutdated$1 : leadOutdated$2;
	var leadOutdated = { pathData };

	return leadOutdated;

});
