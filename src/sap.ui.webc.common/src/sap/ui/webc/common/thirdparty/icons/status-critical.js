sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/status-critical', './v4/status-critical'], function (exports, Theme, statusCritical$1, statusCritical$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? statusCritical$1.pathData : statusCritical$2.pathData;
	var statusCritical = "status-critical";

	exports.accData = statusCritical$1.accData;
	exports.ltr = statusCritical$1.ltr;
	exports.default = statusCritical;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
