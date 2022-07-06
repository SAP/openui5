sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/temperature', './v4/temperature'], function (exports, Theme, temperature$1, temperature$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? temperature$1.pathData : temperature$2.pathData;
	var temperature = "temperature";

	exports.accData = temperature$1.accData;
	exports.ltr = temperature$1.ltr;
	exports.default = temperature;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
