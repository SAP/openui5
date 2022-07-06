sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/activate', './v4/activate'], function (exports, Theme, activate$1, activate$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? activate$1.pathData : activate$2.pathData;
	var activate = "activate";

	exports.accData = activate$1.accData;
	exports.ltr = activate$1.ltr;
	exports.default = activate;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
