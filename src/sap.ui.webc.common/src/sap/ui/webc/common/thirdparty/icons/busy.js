sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/busy', './v4/busy'], function (exports, Theme, busy$1, busy$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? busy$1.pathData : busy$2.pathData;
	var busy = "busy";

	exports.accData = busy$1.accData;
	exports.ltr = busy$1.ltr;
	exports.default = busy;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
