sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/unpaid-leave', './v4/unpaid-leave'], function (Theme, unpaidLeave$2, unpaidLeave$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? unpaidLeave$1 : unpaidLeave$2;
	var unpaidLeave = { pathData };

	return unpaidLeave;

});
