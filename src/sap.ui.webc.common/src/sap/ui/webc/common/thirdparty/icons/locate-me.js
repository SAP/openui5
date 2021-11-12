sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/locate-me', './v4/locate-me'], function (Theme, locateMe$2, locateMe$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? locateMe$1 : locateMe$2;
	var locateMe = { pathData };

	return locateMe;

});
