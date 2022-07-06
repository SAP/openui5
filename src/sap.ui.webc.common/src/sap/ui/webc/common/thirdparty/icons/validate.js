sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/validate', './v4/validate'], function (exports, Theme, validate$1, validate$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? validate$1.pathData : validate$2.pathData;
	var validate = "validate";

	exports.accData = validate$1.accData;
	exports.ltr = validate$1.ltr;
	exports.default = validate;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
