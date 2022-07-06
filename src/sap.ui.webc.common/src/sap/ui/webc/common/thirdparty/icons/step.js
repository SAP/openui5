sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/step', './v4/step'], function (exports, Theme, step$1, step$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? step$1.pathData : step$2.pathData;
	var step = "step";

	exports.accData = step$1.accData;
	exports.ltr = step$1.ltr;
	exports.default = step;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
