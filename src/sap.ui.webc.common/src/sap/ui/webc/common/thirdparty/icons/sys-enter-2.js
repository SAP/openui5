sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-enter-2', './v4/sys-enter-2'], function (Theme, sysEnter2$2, sysEnter2$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? sysEnter2$1 : sysEnter2$2;
	var sysEnter2 = { pathData };

	return sysEnter2;

});
