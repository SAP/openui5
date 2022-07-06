sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/employee-pane', './v4/employee-pane'], function (exports, Theme, employeePane$1, employeePane$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? employeePane$1.pathData : employeePane$2.pathData;
	var employeePane = "employee-pane";

	exports.accData = employeePane$1.accData;
	exports.ltr = employeePane$1.ltr;
	exports.default = employeePane;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
