sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/washing-machine', './v4/washing-machine'], function (exports, Theme, washingMachine$1, washingMachine$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? washingMachine$1.pathData : washingMachine$2.pathData;
	var washingMachine = "washing-machine";

	exports.accData = washingMachine$1.accData;
	exports.ltr = washingMachine$1.ltr;
	exports.default = washingMachine;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
