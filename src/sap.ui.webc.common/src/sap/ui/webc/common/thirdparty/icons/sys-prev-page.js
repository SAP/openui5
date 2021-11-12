sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-prev-page', './v4/sys-prev-page'], function (Theme, sysPrevPage$2, sysPrevPage$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? sysPrevPage$1 : sysPrevPage$2;
	var sysPrevPage = { pathData };

	return sysPrevPage;

});
