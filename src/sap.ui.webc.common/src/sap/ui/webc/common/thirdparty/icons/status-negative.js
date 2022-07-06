sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/status-negative', './v4/status-negative'], function (exports, Theme, statusNegative$1, statusNegative$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? statusNegative$1.pathData : statusNegative$2.pathData;
	var statusNegative = "status-negative";

	exports.accData = statusNegative$1.accData;
	exports.ltr = statusNegative$1.ltr;
	exports.default = statusNegative;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
