sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/burglary', './v4/burglary'], function (exports, Theme, burglary$1, burglary$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? burglary$1.pathData : burglary$2.pathData;
	var burglary = "burglary";

	exports.accData = burglary$1.accData;
	exports.ltr = burglary$1.ltr;
	exports.default = burglary;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
