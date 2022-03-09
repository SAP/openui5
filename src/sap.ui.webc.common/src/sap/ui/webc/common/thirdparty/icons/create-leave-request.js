sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/create-leave-request', './v4/create-leave-request'], function (Theme, createLeaveRequest$2, createLeaveRequest$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? createLeaveRequest$1 : createLeaveRequest$2;
	var createLeaveRequest = { pathData };

	return createLeaveRequest;

});
