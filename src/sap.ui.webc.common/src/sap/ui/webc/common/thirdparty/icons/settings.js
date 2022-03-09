sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/settings', './v4/settings'], function (Theme, settings$2, settings$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? settings$1 : settings$2;
	var settings = { pathData };

	return settings;

});
