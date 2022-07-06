sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/call', './v4/call'], function (exports, Theme, call$1, call$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? call$1.pathData : call$2.pathData;
	var call = "call";

	exports.accData = call$1.accData;
	exports.ltr = call$1.ltr;
	exports.default = call;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
