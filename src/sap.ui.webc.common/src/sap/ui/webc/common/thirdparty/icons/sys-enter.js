sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-enter', './v4/sys-enter'], function (Theme, sysEnter$2, sysEnter$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? sysEnter$1 : sysEnter$2;
	var sysEnter = { pathData };

	return sysEnter;

});
