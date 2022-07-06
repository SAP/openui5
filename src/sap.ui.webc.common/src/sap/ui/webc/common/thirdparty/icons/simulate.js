sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/simulate', './v4/simulate'], function (exports, Theme, simulate$1, simulate$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? simulate$1.pathData : simulate$2.pathData;
	var simulate = "simulate";

	exports.accData = simulate$1.accData;
	exports.ltr = simulate$1.ltr;
	exports.default = simulate;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
