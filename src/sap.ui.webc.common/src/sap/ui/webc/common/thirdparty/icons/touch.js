sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/touch', './v4/touch'], function (exports, Theme, touch$1, touch$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? touch$1.pathData : touch$2.pathData;
	var touch = "touch";

	exports.accData = touch$1.accData;
	exports.ltr = touch$1.ltr;
	exports.default = touch;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
