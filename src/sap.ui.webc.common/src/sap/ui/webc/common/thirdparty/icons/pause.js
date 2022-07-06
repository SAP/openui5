sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pause', './v4/pause'], function (exports, Theme, pause$1, pause$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pause$1.pathData : pause$2.pathData;
	var pause = "pause";

	exports.accData = pause$1.accData;
	exports.ltr = pause$1.ltr;
	exports.default = pause;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
