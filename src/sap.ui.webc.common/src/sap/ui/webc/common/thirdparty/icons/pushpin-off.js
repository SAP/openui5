sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pushpin-off', './v4/pushpin-off'], function (exports, Theme, pushpinOff$1, pushpinOff$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pushpinOff$1.pathData : pushpinOff$2.pathData;
	var pushpinOff = "pushpin-off";

	exports.accData = pushpinOff$1.accData;
	exports.ltr = pushpinOff$1.ltr;
	exports.default = pushpinOff;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
