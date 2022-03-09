sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/employee-pane', './v4/employee-pane'], function (Theme, employeePane$2, employeePane$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? employeePane$1 : employeePane$2;
	var employeePane = { pathData };

	return employeePane;

});
