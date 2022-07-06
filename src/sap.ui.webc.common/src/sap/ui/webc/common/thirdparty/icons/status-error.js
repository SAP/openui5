sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/status-error', './v4/status-error'], function (exports, Theme, statusError$1, statusError$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? statusError$1.pathData : statusError$2.pathData;
	var statusError = "status-error";

	exports.accData = statusError$1.accData;
	exports.ltr = statusError$1.ltr;
	exports.default = statusError;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
