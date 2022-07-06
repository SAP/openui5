sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/accept', './v4/accept'], function (exports, Theme, accept$1, accept$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? accept$1.pathData : accept$2.pathData;
	var accept = "accept";

	exports.accData = accept$1.accData;
	exports.ltr = accept$1.ltr;
	exports.default = accept;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
