sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/general-leave-request', './v4/general-leave-request'], function (Theme, generalLeaveRequest$2, generalLeaveRequest$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? generalLeaveRequest$1 : generalLeaveRequest$2;
	var generalLeaveRequest = { pathData };

	return generalLeaveRequest;

});
