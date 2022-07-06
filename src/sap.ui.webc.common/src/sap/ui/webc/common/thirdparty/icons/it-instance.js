sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/it-instance', './v4/it-instance'], function (exports, Theme, itInstance$1, itInstance$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? itInstance$1.pathData : itInstance$2.pathData;
	var itInstance = "it-instance";

	exports.accData = itInstance$1.accData;
	exports.ltr = itInstance$1.ltr;
	exports.default = itInstance;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
