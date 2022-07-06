sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/signature', './v4/signature'], function (exports, Theme, signature$1, signature$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? signature$1.pathData : signature$2.pathData;
	var signature = "signature";

	exports.accData = signature$1.accData;
	exports.ltr = signature$1.ltr;
	exports.default = signature;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
