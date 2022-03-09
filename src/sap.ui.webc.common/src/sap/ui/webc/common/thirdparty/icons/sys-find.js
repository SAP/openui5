sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-find', './v4/sys-find'], function (Theme, sysFind$2, sysFind$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysFind$1 : sysFind$2;
	var sysFind = { pathData };

	return sysFind;

});
