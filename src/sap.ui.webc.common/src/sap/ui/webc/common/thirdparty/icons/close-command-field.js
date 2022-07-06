sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/close-command-field', './v4/close-command-field'], function (exports, Theme, closeCommandField$1, closeCommandField$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? closeCommandField$1.pathData : closeCommandField$2.pathData;
	var closeCommandField = "close-command-field";

	exports.accData = closeCommandField$1.accData;
	exports.ltr = closeCommandField$1.ltr;
	exports.default = closeCommandField;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
