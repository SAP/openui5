sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/machine', './v4/machine'], function (exports, Theme, machine$1, machine$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? machine$1.pathData : machine$2.pathData;
	var machine = "machine";

	exports.accData = machine$1.accData;
	exports.ltr = machine$1.ltr;
	exports.default = machine;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
