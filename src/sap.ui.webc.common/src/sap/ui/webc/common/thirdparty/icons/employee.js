sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/employee', './v4/employee'], function (exports, Theme, employee$1, employee$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? employee$1.pathData : employee$2.pathData;
	var employee = "employee";

	exports.accData = employee$1.accData;
	exports.ltr = employee$1.ltr;
	exports.default = employee;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
