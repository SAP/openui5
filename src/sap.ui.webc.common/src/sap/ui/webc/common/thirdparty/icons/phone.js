sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/phone', './v4/phone'], function (exports, Theme, phone$1, phone$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? phone$1.pathData : phone$2.pathData;
	var phone = "phone";

	exports.accData = phone$1.accData;
	exports.ltr = phone$1.ltr;
	exports.default = phone;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
