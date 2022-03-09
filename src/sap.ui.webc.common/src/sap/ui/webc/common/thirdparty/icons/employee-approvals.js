sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/employee-approvals', './v4/employee-approvals'], function (Theme, employeeApprovals$2, employeeApprovals$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? employeeApprovals$1 : employeeApprovals$2;
	var employeeApprovals = { pathData };

	return employeeApprovals;

});
