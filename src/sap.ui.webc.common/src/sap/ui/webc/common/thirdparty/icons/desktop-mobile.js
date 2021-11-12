sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/desktop-mobile', './v4/desktop-mobile'], function (Theme, desktopMobile$2, desktopMobile$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? desktopMobile$1 : desktopMobile$2;
	var desktopMobile = { pathData };

	return desktopMobile;

});
