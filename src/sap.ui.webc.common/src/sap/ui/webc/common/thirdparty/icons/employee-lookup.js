sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/employee-lookup', './v4/employee-lookup'], function (exports, Theme, employeeLookup$1, employeeLookup$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? employeeLookup$1.pathData : employeeLookup$2.pathData;
	var employeeLookup = "employee-lookup";

	exports.accData = employeeLookup$1.accData;
	exports.ltr = employeeLookup$1.ltr;
	exports.default = employeeLookup;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
