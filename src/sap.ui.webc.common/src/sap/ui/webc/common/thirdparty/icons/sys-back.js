sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-back', './v4/sys-back'], function (Theme, sysBack$2, sysBack$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysBack$1 : sysBack$2;
	var sysBack = { pathData };

	return sysBack;

});
