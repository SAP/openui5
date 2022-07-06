sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/fax-machine', './v4/fax-machine'], function (exports, Theme, faxMachine$1, faxMachine$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? faxMachine$1.pathData : faxMachine$2.pathData;
	var faxMachine = "fax-machine";

	exports.accData = faxMachine$1.accData;
	exports.ltr = faxMachine$1.ltr;
	exports.default = faxMachine;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
