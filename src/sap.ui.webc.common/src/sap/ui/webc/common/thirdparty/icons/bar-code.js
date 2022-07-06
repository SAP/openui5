sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bar-code', './v4/bar-code'], function (exports, Theme, barCode$1, barCode$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? barCode$1.pathData : barCode$2.pathData;
	var barCode = "bar-code";

	exports.accData = barCode$1.accData;
	exports.ltr = barCode$1.ltr;
	exports.default = barCode;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
