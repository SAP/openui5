sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cancel-share', './v4/cancel-share'], function (exports, Theme, cancelShare$1, cancelShare$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cancelShare$1.pathData : cancelShare$2.pathData;
	var cancelShare = "cancel-share";

	exports.accData = cancelShare$1.accData;
	exports.ltr = cancelShare$1.ltr;
	exports.default = cancelShare;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
