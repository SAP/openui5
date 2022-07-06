sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cancel', './v4/cancel'], function (exports, Theme, cancel$1, cancel$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cancel$1.pathData : cancel$2.pathData;
	var cancel = "cancel";

	exports.accData = cancel$1.accData;
	exports.ltr = cancel$1.ltr;
	exports.default = cancel;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
