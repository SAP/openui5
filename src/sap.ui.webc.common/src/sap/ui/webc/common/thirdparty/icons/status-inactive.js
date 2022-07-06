sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/status-inactive', './v4/status-inactive'], function (exports, Theme, statusInactive$1, statusInactive$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? statusInactive$1.pathData : statusInactive$2.pathData;
	var statusInactive = "status-inactive";

	exports.accData = statusInactive$1.accData;
	exports.ltr = statusInactive$1.ltr;
	exports.default = statusInactive;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
