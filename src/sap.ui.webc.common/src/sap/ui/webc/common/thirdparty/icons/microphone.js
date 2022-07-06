sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/microphone', './v4/microphone'], function (exports, Theme, microphone$1, microphone$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? microphone$1.pathData : microphone$2.pathData;
	var microphone = "microphone";

	exports.accData = microphone$1.accData;
	exports.ltr = microphone$1.ltr;
	exports.default = microphone;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
