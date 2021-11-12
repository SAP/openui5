sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/lateness', './v4/lateness'], function (Theme, lateness$2, lateness$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? lateness$1 : lateness$2;
	var lateness = { pathData };

	return lateness;

});
