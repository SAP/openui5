sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/home-share', './v4/home-share'], function (Theme, homeShare$2, homeShare$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? homeShare$1 : homeShare$2;
	var homeShare = { pathData };

	return homeShare;

});
