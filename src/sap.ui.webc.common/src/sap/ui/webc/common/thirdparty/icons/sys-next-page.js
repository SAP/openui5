sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-next-page', './v4/sys-next-page'], function (Theme, sysNextPage$2, sysNextPage$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? sysNextPage$1 : sysNextPage$2;
	var sysNextPage = { pathData };

	return sysNextPage;

});
