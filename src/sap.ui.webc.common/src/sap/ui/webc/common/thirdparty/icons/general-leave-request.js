sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/general-leave-request', './v4/general-leave-request'], function (exports, Theme, generalLeaveRequest$1, generalLeaveRequest$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? generalLeaveRequest$1.pathData : generalLeaveRequest$2.pathData;
	var generalLeaveRequest = "general-leave-request";

	exports.accData = generalLeaveRequest$1.accData;
	exports.ltr = generalLeaveRequest$1.ltr;
	exports.default = generalLeaveRequest;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
