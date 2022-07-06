sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/employee-approvals', './v4/employee-approvals'], function (exports, Theme, employeeApprovals$1, employeeApprovals$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? employeeApprovals$1.pathData : employeeApprovals$2.pathData;
	var employeeApprovals = "employee-approvals";

	exports.accData = employeeApprovals$1.accData;
	exports.ltr = employeeApprovals$1.ltr;
	exports.default = employeeApprovals;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
