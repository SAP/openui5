sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/employee-rejections', './v4/employee-rejections'], function (exports, Theme, employeeRejections$1, employeeRejections$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? employeeRejections$1.pathData : employeeRejections$2.pathData;
	var employeeRejections = "employee-rejections";

	exports.accData = employeeRejections$1.accData;
	exports.ltr = employeeRejections$1.ltr;
	exports.default = employeeRejections;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
