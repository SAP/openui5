sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-back-2', './v4/sys-back-2'], function (Theme, sysBack2$2, sysBack2$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysBack2$1 : sysBack2$2;
	var sysBack2 = { pathData };

	return sysBack2;

});
