sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-last-page', './v4/sys-last-page'], function (Theme, sysLastPage$2, sysLastPage$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? sysLastPage$1 : sysLastPage$2;
	var sysLastPage = { pathData };

	return sysLastPage;

});
