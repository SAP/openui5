sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/create-leave-request', './v4/create-leave-request'], function (exports, Theme, createLeaveRequest$1, createLeaveRequest$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? createLeaveRequest$1.pathData : createLeaveRequest$2.pathData;
	var createLeaveRequest = "create-leave-request";

	exports.accData = createLeaveRequest$1.accData;
	exports.ltr = createLeaveRequest$1.ltr;
	exports.default = createLeaveRequest;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
