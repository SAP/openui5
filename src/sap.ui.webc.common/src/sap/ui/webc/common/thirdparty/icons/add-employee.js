sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-employee', './v4/add-employee'], function (exports, Theme, addEmployee$1, addEmployee$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addEmployee$1.pathData : addEmployee$2.pathData;
	var addEmployee = "add-employee";

	exports.accData = addEmployee$1.accData;
	exports.ltr = addEmployee$1.ltr;
	exports.default = addEmployee;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
