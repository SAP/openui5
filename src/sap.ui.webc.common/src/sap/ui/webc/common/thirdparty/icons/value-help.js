sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/value-help', './v4/value-help'], function (exports, Theme, valueHelp$1, valueHelp$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? valueHelp$1.pathData : valueHelp$2.pathData;
	var valueHelp = "value-help";

	exports.accData = valueHelp$1.accData;
	exports.ltr = valueHelp$1.ltr;
	exports.default = valueHelp;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
