sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/paid-leave', './v4/paid-leave'], function (Theme, paidLeave$2, paidLeave$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? paidLeave$1 : paidLeave$2;
	var paidLeave = { pathData };

	return paidLeave;

});
