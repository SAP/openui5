sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/fallback', './v4/fallback'], function (Theme, fallback$2, fallback$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? fallback$1 : fallback$2;
	var fallback = { pathData };

	return fallback;

});
