sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-first-page', './v4/sys-first-page'], function (Theme, sysFirstPage$2, sysFirstPage$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysFirstPage$1 : sysFirstPage$2;
	var sysFirstPage = { pathData };

	return sysFirstPage;

});
