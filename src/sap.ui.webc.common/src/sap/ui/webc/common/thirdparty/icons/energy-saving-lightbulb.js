sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/energy-saving-lightbulb', './v4/energy-saving-lightbulb'], function (exports, Theme, energySavingLightbulb$1, energySavingLightbulb$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? energySavingLightbulb$1.pathData : energySavingLightbulb$2.pathData;
	var energySavingLightbulb = "energy-saving-lightbulb";

	exports.accData = energySavingLightbulb$1.accData;
	exports.ltr = energySavingLightbulb$1.ltr;
	exports.default = energySavingLightbulb;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
