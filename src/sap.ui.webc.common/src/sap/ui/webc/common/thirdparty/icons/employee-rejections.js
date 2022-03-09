sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/employee-rejections', './v4/employee-rejections'], function (Theme, employeeRejections$2, employeeRejections$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? employeeRejections$1 : employeeRejections$2;
	var employeeRejections = { pathData };

	return employeeRejections;

});
