sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/status-completed', './v4/status-completed'], function (exports, Theme, statusCompleted$1, statusCompleted$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? statusCompleted$1.pathData : statusCompleted$2.pathData;
	var statusCompleted = "status-completed";

	exports.accData = statusCompleted$1.accData;
	exports.ltr = statusCompleted$1.ltr;
	exports.default = statusCompleted;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
